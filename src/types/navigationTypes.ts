import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Map: undefined; // Añade otros parámetros si es necesario
};


export type HomeScreenProps = {
    navigation: any; // Usar 'Home' si es la ruta de HomeScreen.
};


export type LoginScreenProps = {
    navigation: any;
};

/* Tambien se puede 
export type HomeScreenProps = {
    navigation: any; // Aquí deberías reemplazar 'any' por el tipo específico de tu objeto de navegación.
};*/
