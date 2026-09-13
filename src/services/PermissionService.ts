import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export class PermissionService {
  static async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        Alert.alert(
          'Kamera-Berechtigung erforderlich',
          'Diese App benötigt Zugriff auf die Kamera für QR-Code-Scans.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Einstellungen öffnen', onPress: () => this.openSettings() }
          ]
        );
        return false;
      } else {
        Alert.alert(
          'Kamera-Berechtigung verweigert',
          'Bitte aktivieren Sie die Kamera-Berechtigung in den Einstellungen.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Einstellungen öffnen', onPress: () => this.openSettings() }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Fehler bei der Kamera-Berechtigung:', error);
      return false;
    }
  }

  static async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Speicher-Berechtigung erforderlich',
          'Diese App benötigt Zugriff auf den Speicher für lokale Daten.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Einstellungen öffnen', onPress: () => this.openSettings() }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Fehler bei der Speicher-Berechtigung:', error);
      return false;
    }
  }

  static async checkCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      const result = await check(PERMISSIONS.ANDROID.CAMERA);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Fehler beim Prüfen der Kamera-Berechtigung:', error);
      return false;
    }
  }

  static async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      const result = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Fehler beim Prüfen der Speicher-Berechtigung:', error);
      return false;
    }
  }

  static async checkAllPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    const cameraPermission = await this.checkCameraPermission();
    const storagePermission = await this.checkStoragePermission();
    
    return cameraPermission && storagePermission;
  }

  static async requestAllPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    const cameraPermission = await this.requestCameraPermission();
    const storagePermission = await this.requestStoragePermission();
    
    return cameraPermission && storagePermission;
  }

  static async requestPermissionsIfNeeded(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    const hasAllPermissions = await this.checkAllPermissions();
    
    if (!hasAllPermissions) {
      return await this.requestAllPermissions();
    }
    
    return true;
  }

  private static openSettings() {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  }

  // ColorOS-spezifische Hilfsmethoden
  static getColorOSOptimizationTips(): string[] {
    return [
      'Aktivieren Sie den Autostart-Manager für diese App',
      'Schließen Sie die App von der Batterieoptimierung aus',
      'Erlauben Sie Hintergrundaktivitäten',
      'Aktivieren Sie Push-Benachrichtigungen'
    ];
  }

  static showColorOSOptimizationDialog() {
    if (Platform.OS !== 'android') return;
    
    Alert.alert(
      'ColorOS-Optimierung',
      'Für optimale Funktionalität auf OPPO-Geräten:',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Einstellungen öffnen', 
          onPress: () => this.openSettings() 
        }
      ]
    );
  }
}
