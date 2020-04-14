import * as ImagePicker from 'expo-image-picker';

const avatarPicker = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1
};
export default avatarPicker