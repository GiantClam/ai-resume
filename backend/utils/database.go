package utils

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db   *gorm.DB
	once sync.Once
)

// InitDB 初始化数据库连接
func InitDB() (*gorm.DB, error) {
	var err error

	once.Do(func() {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}

		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}

		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}

		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "ai_resume"
		}

		sslmode := os.Getenv("DB_SSLMODE")
		if sslmode == "" {
			sslmode = "disable"
		}

		dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			host, port, user, password, dbname, sslmode)

		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Printf("连接数据库失败: %v", err)
			return
		}

		// 设置数据库连接池
		sqlDB, err := db.DB()
		if err != nil {
			log.Printf("获取SQL DB失败: %v", err)
			return
		}

		// 设置连接池配置
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)

		log.Println("成功连接到数据库")
	})

	return db, err
}

// GetDB 获取已初始化的数据库连接
func GetDB() *gorm.DB {
	if db == nil {
		_, err := InitDB()
		if err != nil {
			log.Fatalf("无法获取数据库连接: %v", err)
		}
	}
	return db
}
