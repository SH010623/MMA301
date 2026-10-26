
import AsyncStorage from "@react-native-async-storage/async-storage";

const PHOTO_KEY = "photo_journal_items";

export async function getPhotos() {
  const value = await AsyncStorage.getItem(PHOTO_KEY);
  return value ? JSON.parse(value) : [];
}

export async function savePhotos(photos) {
  await AsyncStorage.setItem(
    PHOTO_KEY,
    JSON.stringify(photos)
  );
}
