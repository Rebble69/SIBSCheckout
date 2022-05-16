import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { Camera, BarCodeScanningResult, CameraType } from "expo-camera";
import {} from "react-native-paper";
import StudentCard from "./components/StudentCard";
import axios from "axios";

export interface IStudent {
  name: string;
  parentName: string;
  rawUrl: string;
}

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [text, setText] = useState<string>("Not yet scanned");
  const [students, setStudents] = useState<IStudent[]>([]);
  const [paused, setPaused] = useState(false);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  const handleCancel: (props: IStudent) => any = ({ rawUrl, name }) => {
    console.log("Removed Student:", name);
    const removalStudentIndex = students.findIndex(
      (student) => student.rawUrl === rawUrl
    );
    setStudents(students.filter((_, index) => index !== removalStudentIndex));
  };

  const handleCheckout: (props: IStudent) => any = async ({ rawUrl }) => {
    const entries = rawUrl.split("?")[1].split("&");

    console.log(rawUrl.split("/")[6]);

    const postBody: Map<string, string> = new Map();

    entries.forEach((entry) => {
      const [key, value] = entry.split("=");
      postBody.set(key, value);
    });

    const res = await axios({
      url: `https://docs.google.com/forms/d/e/${
        rawUrl.split("/")[6]
      }/formResponse`,

      method: "POST",
      headers: {
        authority: "docs.google.com",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
      },
      data: Object.fromEntries(postBody),
    });

    if (res.status === 200) {
      const removalStudentIndex = students.findIndex(
        (student) => student.rawUrl === rawUrl
      );
      setStudents(students.filter((_, index) => index !== removalStudentIndex));
      return;
    }

    Alert.alert("Error", "Something went wrong, please contact max y9`");
  };

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }: BarCodeScanningResult) => {
    setText(data);

    // if barcode invalid
    if (!data.startsWith("https://docs.google.com/forms/")) {
      setPaused(true);
      Alert.alert("Invalid QR Code", "Please scan a valid QR code", [
        { text: "OK", onPress: () => setPaused(false) },
      ]);
      return;
    }

    // if barcode valid
    const newStudent: IStudent = {
      name: data.split("/")[7].split("=")[2].split("&")[0],
      parentName: data.split("=")[3],
      rawUrl: data,
    };

    if (students.find((student) => student.rawUrl === newStudent.rawUrl))
      return;

    console.log(students);

    console.log({ newStudent });

    setStudents([...students, newStudent]);

    console.log("Type: " + type + "\nData: " + data);
  };

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button
          title={"Allow Camera"}
          onPress={() => askForCameraPermission()}
        />
      </View>
    );
  }

  // Return the View
  return (
    <ScrollView>
      <View>
        <Camera
          onBarCodeScanned={!paused ? handleBarCodeScanned : undefined}
          style={{ width: 400, height: 300 }}
          ratio="1:1"
        />
      </View>
      <Text style={styles.maintext}>{text}</Text>
      {students.map((student) => {
        return (
          <StudentCard
            name={student.name}
            parentName={student.parentName}
            rawUrl={student.rawUrl}
            key={student.rawUrl}
            onCancel={handleCancel}
            onCheckout={handleCheckout}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "tomato",
  },
});
