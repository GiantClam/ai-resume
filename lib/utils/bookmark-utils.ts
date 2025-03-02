"use client";

/**
 * 检测浏览器是否已收藏当前网站
 * 注意：由于浏览器安全限制，JavaScript无法直接访问用户的收藏夹
 * 此方法尝试使用多种方式进行检测，但不能保证100%准确
 */
export async function isBookmarked(): Promise<boolean> {
  // 第一种方法：尝试使用Web API中的navigator.permissions (不是所有浏览器都支持)
  try {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      const permissionStatus = await (navigator.permissions as any).query({
        name: 'web-app-manifest-management'
      });
      if (permissionStatus.state === 'granted') {
        console.log('[Bookmark] 检测到网站可能已被收藏');
        return true;
      }
    }
  } catch (err) {
    console.log('[Bookmark] 权限检测方法不支持', err);
  }

  // 第二种方法：检查是否存在PWA安装状态
  try {
    if (
      typeof window !== 'undefined' && 
      'matchMedia' in window && 
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      console.log('[Bookmark] 检测到网站已作为PWA安装');
      return true;
    }
  } catch (err) {
    console.log('[Bookmark] PWA检测方法出错', err);
  }

  // 第三种方法：检查localStorage中是否有用户确认已收藏的标记
  try {
    if (typeof window !== 'undefined' && window.localStorage.getItem('user-confirmed-bookmarked') === 'true') {
      console.log('[Bookmark] 用户已确认收藏过网站');
      return true;
    }
  } catch (err) {
    console.log('[Bookmark] localStorage检测出错', err);
  }

  // 默认假设未收藏
  console.log('[Bookmark] 假设网站未被收藏');
  return false;
}

/**
 * 将用户确认的收藏状态保存到localStorage
 */
export function setUserConfirmedBookmark(value: boolean = true): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user-confirmed-bookmarked', value ? 'true' : 'false');
      console.log('[Bookmark] 已保存用户确认的收藏状态:', value);
    }
  } catch (err) {
    console.log('[Bookmark] 保存用户确认状态出错', err);
  }
} 