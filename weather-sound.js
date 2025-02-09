const API_KEY = 'YOUR_API_KEY'; // OpenWeatherMap API 키
const CITY = 'Seoul'; // 날씨를 가져올 도시 이름

// ✅ 현재 시간대 확인 함수
function getTimePeriod() {
  const hour = new Date().getHours(); // 현재 시간 가져오기
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
    const weather = data.weather[0].main.toLowerCase(); // 날씨 상태
    const timePeriod = getTimePeriod(); // 시간대 가져오기 (day/night)
    const audio = document.getElementById('background-audio');
    const weatherStatus = document.getElementById('weather-status');

    let soundFile = '';

    if (weather.includes('clear')) {
      soundFile = `${timePeriod}-밤맑음.mp3`;
      weatherStatus.textContent = `현재 날씨: 화창함 (${timePeriod === 'day' ? '아침/낮' : '밤'}) 🌞`;
    } else if (weather.includes('clouds')) {
      soundFile = `${timePeriod}-밤맑음.mp3`;
      weatherStatus.textContent = `현재 날씨: 흐림 (${timePeriod === 'day' ? '아침/낮' : '밤'}) ☁️`;
    } else if (weather.includes('rain')) {
      soundFile = `${timePeriod}-소나기.mp3`;
      weatherStatus.textContent = `현재 날씨: 비 (${timePeriod === 'day' ? '아침/낮' : '밤'}) 🌧️`;
    } else {
      weatherStatus.textContent = `현재 날씨: ${data.weather[0].description} (${timePeriod === 'day' ? '아침/낮' : '밤'})`;
    }

    if (soundFile) {
      audio.src = soundFile; // 적절한 소리 파일 설정
      audio.play(); // 소리 재생
    }
  } catch (error) {
    console.error(error.message);
    document.getElementById('weather-status').textContent =
      '날씨 정보를 가져오는 데 실패했습니다.';
  }
}

// ✅ 함수 실행
getWeather(CITY);
