import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import { ActivityIndicator, FAB, Switch } from 'react-native-paper';
import axios, { AxiosError } from 'axios';
import * as Location from 'expo-location';

interface Condition {
  icon: string;
  text: string;
}

interface Current {
  condition: Condition;
  temp_c: number;
}

interface LocationData {
  name: string;
}

interface WeatherData {
  location: LocationData;
  current: Current;
}

export default function ClimaZord() {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  function removerAcentos(city: string): string {
    return city.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const fetchApi = async (city: string) => {
    if (!city) {
      setErrorMessage('Por favor, digite o nome da cidade.');
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);

      const API_KEY = '340a1713cb70427d88f181855233108';
      const cityNameWithoutAccents = removerAcentos(city);
      const URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityNameWithoutAccents}&days=1&aqi=no&alerts=no`;


      console.log('URL da requisição:', URL);

      const { data } = await axios.get<WeatherData>(URL);
      setWeatherData(data);
      Keyboard.dismiss();
      setCity('');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 403) {
          setErrorMessage('Acesso à API negado. Verifique sua chave de API.');
        } else {
          setErrorMessage(
            'Ocorreu um erro ao buscar os dados climáticos. Por favor, tente novamente mais tarde.'
          );
        }
      } else {
        setErrorMessage(
          'Ocorreu um erro ao buscar os dados climáticos. Por favor, tente novamente mais tarde.'
        );
      }
      setWeatherData(null);
    } finally {
      setLoading(false); 
    }
  };

  const fetchCurrentLocationWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const cities = await currentLocation(
      location.coords.latitude,
      location.coords.longitude
    );

    

    if (cities && cities.length > 0) {
      const cityName = cities[0].City;

      setCity(cityName);
      await fetchApi(cityName);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentLocationWeather();
    };
    fetchData();
  }, [refresh]);

  const currentLocation = async (
    latitude: number,
    longitude: number
  ): Promise<any[] | null> => {
    const options = {
      method: 'GET',
      url: 'https://geocodeapi.p.rapidapi.com/GetNearestCities',
      params: {
        latitude: latitude,
        longitude: longitude,
        range: '0',
      },
      headers: {
        'X-RapidAPI-Key': '182fa79af9msh68014746f70e61bp19099fjsnc232bccfbb35',
        'X-RapidAPI-Host': 'geocodeapi.p.rapidapi.com',
      },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setRefresh(!refresh);
    if (city) {
      setLoading(false)
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#121212' : '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      margin: -20,
      shadowColor: darkMode ? '#000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    image: {
      width: 300,
      height: 300,
      margin: 0,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      width: '80%',
      marginBottom: 10,
      color: darkMode ? 'white' : 'black',
    },
    button: {
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      width: 150,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
    },
    errorMessage: {
      color: 'red',
      marginVertical: 10,
      padding: 20,
    },
    weatherCard: {
      marginTop: 20,
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cityName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    weatherIcon: {
      width: 50,
      height: 50,
    },
    temperature: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    conditionText: {
      fontSize: 16,
      marginTop: 10,
      padding:20
    },
    refreshButton: {
      width: 50,
      height: 50,
      backgroundColor: 'blue',
      justifyContent: 'center', 
      alignItems: 'center',
    },
    errorContainer: {
      padding:20,
      flexDirection: 'row',
      alignItems: 'center', 
      justifyContent: 'center'
    }
  });



  return (
    <View style={ styles.container }>
      { loading ? (
        <ActivityIndicator animating={ true } size="large" />
      ) : (
        weatherData && (
          <>
            <Switch
              value={ darkMode }
              onValueChange={ () => setDarkMode(!darkMode) }
            />
            <View style={ styles.imageContainer }>
              <Image
                source={ require('../climaZord/assets/climazord.png') }
                style={ styles.image }
                accessibilityLabel="Ícone da Magazord"
              />
            </View>
            <TextInput
              style={ styles.input }
              placeholder="Digite o nome da cidade"
              placeholderTextColor={ darkMode ? 'white' : '#888' }
              value={ city }
              onChangeText={ setCity }
            />
            <TouchableOpacity
              style={ styles.button }
              onPress={ () => fetchApi(city) }
            >
              <Text style={ styles.buttonText }>Pesquisar</Text>
            </TouchableOpacity>

            <View style={ styles.weatherCard }>
              <Text style={ styles.cityName }>
                { weatherData.location.name }
              </Text>
              <Image
                style={ styles.weatherIcon }
                source={ {
                  uri: `https:${weatherData.current.condition.icon}`,
                } }
              />
              <Text style={ styles.temperature }>
                { weatherData.current.temp_c }°C
              </Text>
              <Text style={ styles.conditionText }>
                { weatherData.current.condition.text }
              </Text>
            </View>
          </>
        )
      ) }
      { errorMessage && (
        <View style={ styles.errorContainer }>
          <Text style={ styles.errorMessage }>{ errorMessage }</Text>
          <FAB
            style={ styles.refreshButton }
            icon="refresh"
            onPress={ refreshData }
            color="white"
          />
        </View>
      ) }
    </View>
  );
  }

