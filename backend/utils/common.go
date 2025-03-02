package utils

// Min 返回两个整数中较小的那个
func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Max 返回两个整数中较大的那个
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
