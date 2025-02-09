const API_KEY = 'YOUR_API_KEY'; // OpenWeatherMap API 키
const CITY = 'Seoul'; // 날씨를 가져올 도시 이름

// ✅ 현재 시간대 확인 함수
function getTimePeriod() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night'; // 오전 6시~오후 6시: 낮, 나머지: 밤
}

// ✅ 날씨 정보를 가져오는 함수
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('날씨 정보를 가져올 수 없습니다.');
    const data = await response.json();

    // ✅ 날씨 상태와 시간대에 따른 배경 소리 설정
    const weather = data.weather[0].main.toLowerCase();
    const timePeriod = getTimePeriod();
    const audio = document.getElementById('background-audio');
    const weatherStatus = document.getElementById('weather-status');

    let soundFile = '';

    if (weather.includes('clear')) {
      soundFile = `${timePeriod}-sunny.mp3`;
      weatherStatus.textContent = `현재 날씨: 화창함 (${timePeriod === 'day' ? '아침/낮' : '밤'}) 🌞`;
    } else if (weather.includes('clouds')) {
      soundFile = `${timePeriod}-cloudy.mp3`;
      weatherStatus.textContent = `현재 날씨: 흐림 (${timePeriod === 'day' ? '아침/낮' : '밤'}) ☁️`;
    } else if (weather.includes('rain')) {
      soundFile = `${timePeriod}-rain.mp3`;
      weatherStatus.textContent = `현재 날씨: 비 (${timePeriod === 'day' ? '아침/낮' : '밤'}) 🌧️`;
    } else {
      weatherStatus.textContent = `현재 날씨: ${data.weather[0].description} (${timePeriod === 'day' ? '아침/낮' : '밤'})`;
    }

    // ✅ 음악 설정: 조건에 맞는 음악이 없으면 기본 음악 사용
    if (soundFile) {
      audio.src = soundFile;
    } else {
      audio.src = 'default.m4a'; // 기본 음악
      weatherStatus.textContent += ' | 기본 음악 재생 중 🎵';
    }
    audio.play();
  } catch (error) {
    console.error(error.message);
    document.getElementById('weather-status').textContent =
      '날씨 정보를 가져오는 데 실패했습니다. 기본 음악을 재생합니다. 🎵';

    // 날씨 정보를 가져오지 못했을 때 기본 음악 재생
    const audio = document.getElementById('background-audio');
    audio.src = 'default.mp3';
    audio.play();
  }
}

// ✅ 함수 실행
getWeather(CITY);
