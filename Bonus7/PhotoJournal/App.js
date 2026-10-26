
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy vị trí hiện tại của thiết bị
  async function getCurrentLocation() {
    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Thông báo",
          "Bạn chưa cấp quyền truy cập vị trí."
        );
        return null;
      }

      const result = await Location.getCurrentPositionAsync({});

      return {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
      return null;
    }
  }

  // Chụp ảnh bằng camera
  async function takePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Thông báo",
          "Bạn cần cấp quyền sử dụng camera."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;

      setLoading(true);

      const imageUri = result.assets[0].uri;
      setPhoto(imageUri);

      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh.");
    } finally {
      setLoading(false);
    }
  }

  // Chọn ảnh từ thư viện
  async function choosePhoto() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.7,
        });

      if (result.canceled) return;

      setLoading(true);

      setPhoto(result.assets[0].uri);

      // Lưu vị trí hiện tại khi chọn ảnh.
      // Đây không nhất thiết là vị trí ảnh được chụp.
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Photo Journal</Text>

      <Text style={styles.subtitle}>
        Chụp ảnh và lưu lại khoảnh khắc của bạn
      </Text>

      <View style={styles.button}>
        <Button
          title="Chụp ảnh"
          onPress={takePhoto}
        />
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

          <Image
            source={{ uri: photo }}
            style={styles.photo}
          />
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

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={location}
              title="Vị trí"
              description="Vị trí được ghi nhận trên thiết bị"
            />
          </MapView>
        </View>
      )}

      {!photo && (
        <Text style={styles.hint}>
          Hãy chụp ảnh hoặc chọn một ảnh để bắt đầu.
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
    textAlign: "center",
    color: "#666666",
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
    borderRadius: 12,
  },
  hint: {
    textAlign: "center",
    color: "#666666",
    marginTop: 30,
  },
});
