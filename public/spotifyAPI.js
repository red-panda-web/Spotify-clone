/**
 * Получение токена
 * @async
 * @returns {string} - токен
 */
async function getToken() {
   const client_id = '94f3861b2e9e447ba80a65e27dd0e0e0';
   const client_secret = '66a710ae89994c60a5bdbc483e6ec8da';
   const request = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
         "Authorization": "Basic " + btoa(`${client_id}:${client_secret}`),
         "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials"
   })
   
   if (request.status === 200) {
      const answer = await request.json();
      return answer.access_token;
   }
   else alert(`Error ${request.status}`);
}

/**
 * Получение категорий
 * @async
 * @param {number} count - необходимое количество категорий 
 * @returns {object} - объект с категориями
 */
export async function getCategories(count) {
   const token = await getToken();
   const request = await fetch(`https://api.spotify.com/v1/browse/categories?country=US&limit=${count > 0 && count <= 50? count : 20}`, {
      method: "GET",
      headers: {
         "Authorization": "Bearer " + token,
      }
   });

   if (request.status === 200) {
      const answer = await request.json();
      return answer.categories;
   }
   else alert(`Error ${request.status}`);
}

/**
 * Получение плейлистов
 * @async
 * @param {string} categoryID - идентификатор категории
 * @param {number} count - необходимое количество плейлистов
 * @returns {object} - объект с плейлистами
 */
export async function getPlaylists(categoryID, count) {
   const token = await getToken();
   const request = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryID}/playlists?country=US&limit=${count > 0 && count <= 50? count : 20}`, {
      method: "GET",
      headers: {
         "Authorization": "Bearer " + token,
      }
   });

   if (request.status === 200) { 
      const answer = await request.json();
      return answer.playlists;
   }
   else alert(`Error ${request.status}`);
}

/**
 * Получение результатов запроса
 * @async
 * @param {string} query - запрос пользователя
 * @returns {object} - объект с результатами запроса
 */
export async function getResultSearch(query) {
   const token = await getToken();
   const request = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track%2Cartist%2Calbum%2Cplaylist&limit=10`, {
      method: "GET",
      headers: {
         "Authorization": "Bearer " + token,
      }
   });

   if (request.status === 200) { 
      const answer = await request.json();
      return answer;
   }
   else alert(`Error ${request.status}`);
}