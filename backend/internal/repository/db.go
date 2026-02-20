package repository

import (
	"context"
	"fmt"
	"log"
	"net"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	if dsn == "" {
		return nil, fmt.Errorf("SUPABASE_DB_URL is required")
	}

	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("unable to parse connection string: %w", err)
	}

	// Force IPv4 to avoid "no route to host" on IPv6-only Supabase direct connections.
	cfg.ConnConfig.DialFunc = func(ctx context.Context, network, addr string) (net.Conn, error) {
		host, port, err := net.SplitHostPort(addr)
		if err != nil {
			return (&net.Dialer{}).DialContext(ctx, network, addr)
		}
		addrs, err := net.DefaultResolver.LookupHost(ctx, host)
		if err == nil {
			for _, a := range addrs {
				if ip := net.ParseIP(a); ip != nil && ip.To4() != nil {
					return (&net.Dialer{}).DialContext(ctx, "tcp4", net.JoinHostPort(a, port))
				}
			}
		}
		return (&net.Dialer{}).DialContext(ctx, network, addr)
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}
	log.Println("Database connected successfully")
	return pool, nil
}
