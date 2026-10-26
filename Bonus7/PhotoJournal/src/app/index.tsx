
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

type PhotoLocation = {
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<PhotoLocation | null>(null);
  const [loading, setLoading] = useState(false);

  async function getCurrentLocation(): Promise<PhotoLocation | null> {
    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Thông báo",
          "Bạn chưa cho phép ứng dụng truy cập vị trí."
        );
        return null;
      }

      const result = await Location.getCurrentPositionAsync({});

      return {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };
    } catch {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
      return null;
    }
  }

  async function takePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Thông báo", "Bạn cần cho phép sử dụng camera.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;

      setLoading(true);
      setPhoto(result.assets[0].uri);

      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch {
      Alert.alert("Lỗi", "Không thể chụp ảnh.");
    } finally {
      setLoading(false);
    }
  }

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;

      setLoading(true);
      setPhoto(result.assets[0].uri);

      // Đây là vị trí hiện tại khi chọn ảnh,
      // không nhất thiết là nơi ảnh được chụp.
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch {
      Alert.alert("Lỗi", "Không thể chọn ảnh.");
    } finally {
      setLoading(false);
    }
  }

  function deletePhoto() {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có muốn xóa ảnh đang xem không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setPhoto(null);
            setLocation(null);
          },
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Photo Journal</Text>

      <Text style={styles.subtitle}>
        Lưu lại những khoảnh khắc đáng nhớ
      </Text>

      <View style={styles.button}>
        <Button title="Chụp ảnh" onPress={takePhoto} />
      </View>

      <View style={styles.button}>
        <Button
          title="Chọn ảnh từ thư viện"
          onPress={choosePhoto}
        />
      </View>

      {loading && <ActivityIndicator size="large" />}

      {photo && (
        <View style={styles.section}>
          <Text style={styles.heading}>Ảnh của bạn</Text>

          <Image source={{ uri: photo }} style={styles.photo} />

          <View style={styles.button}>
            <Button
              title="Xóa ảnh"
              color="#D32F2F"
              onPress={deletePhoto}
            />
          </View>
        </View>
      )}

      {location && (
        <View style={styles.section}>
          <Text style={styles.heading}>Vị trí</Text>

          <Text>
            Vĩ độ: {location.latitude.toFixed(6)}
          </Text>

          <Text>
            Kinh độ: {location.longitude.toFixed(6)}
          </Text>

          {Platform.OS !== "web" ? (
            <MapView
              style={styles.map}
              initialRegion={{
                ...location,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={location}
                title="Vị trí"
                description="Vị trí được ghi nhận"
              />
            </MapView>
          ) : (
            <Text style={styles.note}>
              Bản đồ cần được kiểm tra trên Android hoặc iOS.
            </Text>
          )}
        </View>
      )}

      {!photo && !loading && (
        <Text style={styles.note}>
          Hãy chụp ảnh hoặc chọn ảnh để bắt đầu.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#F7F8FC",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  section: {
    marginTop: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "#E5E7EB",
  },
  map: {
    width: "100%",
    height: 250,
    marginTop: 12,
  },
  note: {
    color: "#666",
    textAlign: "center",
    marginTop: 24,
  },
});
