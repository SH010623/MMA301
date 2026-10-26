import {
  enableNotifications,
  listenForMessages,
} from "./notifications";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";

function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(auth.currentUser);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(
          auth, email, password
        );

        await setDoc(doc(db, "users", result.user.uid), {
          email,
          phone: "",
          address: "",
        });

        setUser(result.user);
        setMessage("Đăng ký thành công!");
      } else {
        const result = await signInWithEmailAndPassword(
          auth, email, password
        );

        setUser(result.user);
        await loadProfile(result.user);
        setMessage("Đăng nhập thành công!");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadProfile(currentUser) {
    const snapshot = await getDoc(doc(db, "users", currentUser.uid));

    if (snapshot.exists()) {
      const data = snapshot.data();
      setPhone(data.phone || "");
      setAddress(data.address || "");
    }

    setNewEmail(currentUser.email || "");
  }

  async function saveProfile(e) {
    e.preventDefault();
    setMessage("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { phone, address, email: user.email },
        { merge: true }
      );

      if (newEmail && newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
        setNewPassword("");
      }

      setMessage("Cập nhật thông tin thành công!");
    } catch (error) {
      setMessage(
        error.code === "auth/requires-recent-login"
          ? "Bạn cần đăng nhập lại trước khi đổi email hoặc mật khẩu."
          : error.message
      );
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    setEmail("");
    setPassword("");
    setPhone("");
    setAddress("");
    setMessage("Bạn đã đăng xuất.");
  }

  return (
    <main className="container">
      <h1>MMA301 - Firebase Integration</h1>
      <p>Đăng nhập và quản lý thông tin người dùng</p>

      {message && <div className="message">{message}</div>}

      {!user ? (
        <form onSubmit={handleAuth} className="panel">
          <h2>{isRegister ? "Đăng ký" : "Đăng nhập"}</h2>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Mật khẩu (ít nhất 6 ký tự)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit">
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký"}
          </button>
        </form>
      ) : (
        <form onSubmit={saveProfile} className="panel">
          <h2>Thông tin người dùng</h2>
          <p>Đang đăng nhập: {user.email}</p>


          <button
            type="button"
            onClick={async () => {
              try {
                const token = await enableNotifications();
                setMessage(
                  `Đã bật thông báo thành công! Token: ${token.slice(0, 20)}...`
                );
              } catch (error) {
                setMessage(`Lỗi thông báo: ${error.message}`);
              }
            }}
          >
            Bật nhận thông báo
          </button>


          <label>Email mới</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <label>Số điện thoại</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <label>Địa chỉ</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ"
          />

          <label>Mật khẩu mới (để trống nếu không đổi)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            placeholder="Ít nhất 6 ký tự"
          />

          <button type="submit">Lưu thay đổi</button>
          <button
            type="button"
            className="secondary"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </form>
      )}
    </main>
  );
}

export default App;
