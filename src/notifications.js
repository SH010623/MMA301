
import { messagingPromise } from "./firebase";
import {
  getToken,
  onMessage,
} from "firebase/messaging";

// Thay bằng public key VAPID lấy từ Firebase Console
const VAPID_KEY = "BNx4UYAERabPlUbpJ0ran87prQT38YrgVjPQ-tTYAA769T-4QoWq9BngHUqO4dyrj-G2KNX9fiHCrySG9FYg32U";

// Xin quyền nhận thông báo và lấy FCM token
export async function enableNotifications() {
  try {
    if (!("Notification" in window)) {
      throw new Error("Trình duyệt không hỗ trợ thông báo.");
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error("Trình duyệt không hỗ trợ Service Worker.");
    }

    const messaging = await messagingPromise;

    if (!messaging) {
      throw new Error("FCM không được hỗ trợ trên trình duyệt này.");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Bạn chưa cho phép nhận thông báo.");
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error("Không lấy được FCM token.");
    }

    console.log("FCM Token:", token);

    return token;
  } catch (error) {
    console.error("Lỗi bật thông báo:", error);
    throw error;
  }
}

// Nhận thông báo khi ứng dụng đang mở
export async function listenForMessages(callback) {
  const messaging = await messagingPromise;

  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log("FCM message:", payload);

    callback({
      title: payload.notification?.title || "Thông báo mới",
      body: payload.notification?.body || "",
    });
  });
}
