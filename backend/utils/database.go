package utils

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"gorm.io/driver/mysql"
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
		// 判断使用哪种数据库
		dbType := os.Getenv("DB_TYPE")
		if dbType == "" {
			// 默认使用PostgreSQL
			dbType = "postgres"
		}

		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}

		port := os.Getenv("DB_PORT")
		if port == "" {
			if dbType == "postgres" {
				port = "5432"
			} else {
				port = "3306"
			}
		}

		user := os.Getenv("DB_USER")
		if user == "" {
			if dbType == "postgres" {
				user = "postgres"
			} else {
				user = "root"
			}
		}

		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "ai_resume"
		}

		// 根据数据库类型选择连接方式
		if dbType == "postgres" {
			sslmode := os.Getenv("DB_SSLMODE")
			if sslmode == "" {
				sslmode = "disable"
			}

			dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
				host, port, user, password, dbname, sslmode)

			db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		} else {
			// MySQL 连接
			charset := os.Getenv("DB_CHARSET")
			if charset == "" {
				charset = "utf8mb4"
			}

			parseTime := "True"
			loc := "Local"

			dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=%s&loc=%s&auth=native",
				user, password, host, port, dbname, charset, parseTime, loc)

			db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		}

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

		log.Printf("成功连接到 %s 数据库", dbType)
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
