import React, { useState, useEffect } from "react";
import qs from "qs";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { Camera, BarCodeScanningResult } from "expo-camera";
import StudentCard from "./components/StudentCard";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";

export interface IStudent {
  name: string;
  parentName: string;
  rawUrl: string;
  isLoading?: boolean;
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

    const postBody: any = {};

    entries.forEach((entry) => {
      const [key, value] = entry.split("=");
      postBody[key] = value;
    });

    delete postBody["usp"];
    const postData = qs.stringify(postBody, { allowDots: true });

    const res = await axios({
      url: `https://docs.google.com/forms/d/e/${
        rawUrl.split("/")[6]
      }/formResponse`,

      method: "POST",

      data: postData,
    });

    console.log(res.status);

    const removalStudentIndex = students.findIndex(
      (student) => student.rawUrl === rawUrl
    );
    setStudents(students.filter((_, index) => index !== removalStudentIndex));
    return;
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
      name: data.split("/")[7].split("=")[2].split("&")[0].replaceAll("+", " "),
      parentName: data.split("=")[3].replaceAll("+", " "),
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
      <View style={styles.camerabox}>
        <Camera
          onBarCodeScanned={!paused ? handleBarCodeScanned : undefined}
          style={{ width: 480, height: 640 }}
          ratio="4:3"
        />
      </View>
      {/* <Text style={styles.maintext}>{text}</Text> */}
      {students.map((student: IStudent) => {
        return (
          <>
            <ActivityIndicator
              animating={true}
              size={"large"}
              style={styles.loadingSpinner}
            />
            <StudentCard
              name={student.name}
              parentName={student.parentName}
              rawUrl={student.rawUrl}
              key={student.rawUrl}
              onCancel={handleCancel}
              onCheckout={handleCheckout}
            />
          </>
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
  camerabox: {
    overflow: "visible",
    width: 600,
    height: 400,
  },
  loadingSpinner: {
    position: "absolute",
    top: "0%",
    zIndex: 999,
  },
});
