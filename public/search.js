import {getCategories, getResultSearch} from "./spotifyAPI.js";

const HTMLClasses = {
   playlistsRow: ".main__row_playlists", // Строчка с плейлистами
   albumsRow: ".main__row_albums",  // Строчка с альбомами
   artistsRow: ".main__row_artists",   // Строчка с исполнителями
   rowItem: ".main__item_rect",   // Элемент строчки
   rowItemImg: ".main__item-img",  // Картинка элемента
   rowItemTitle: ".main__item-title", // Название элемента
   rowItemDescription: ".main__item-description", // Описание элемента
   categoryItem: ".main__item_square", // Элемент строчки категорий
   categoryItemImg: ".main__category-img",  // Картинка категории
   searchField: ".header__search-input",   // Поле поиска
   searchBestResult: ".main__search-result-best",  // Лучший результат поиска
   searchError: ".search-error", // Ошибка запроса
   sectionBeforeSearch: ".main__before-search", // Секция, показывающая до поиска
   sectionAfterSearch: ".main__after-search", // Секция, показывающаяся после поиска
   trackItem: ".track", // Трек
   trackItemImg: ".track__img",  // Картинка трека
   trackItemAuthor: ".track__author-name",   // Исполнитель трека
   trackItemName: ".track__song-name", // Название трека
   trackItemTime: ".track__time", // Длительность трека
}

/**
 * Отображение категорий при загрузке страницы
 * @async
 */
async function init() {
   const categoryItems = document.querySelectorAll(HTMLClasses.categoryItem); // Элементы категорий
   if (categoryItems.length != 0) {
      const categories = await getCategories(categoryItems.length);  // Получаем столько категорий, сколько элементов
      for (let i = 0; i < categoryItems.length; i++){ // Обходим все элементы
         const title = categoryItems[i].querySelector(HTMLClasses.rowItemTitle); // Находим элемент заголовка и изображения
         const img = categoryItems[i].querySelector(HTMLClasses.categoryItemImg);

         title.textContent = categories.items[i].name;   // И устанавливаем название и картинку одной из полученных категорий
         img.setAttribute("src", categories.items[i].icons[0].url);
      }
   }
}

/**
 * Поиск по введенному запросу
 * @async
 */
async function search() { 
   const sectionBeforeSearch = document.querySelector(HTMLClasses.sectionBeforeSearch);   // Секции, показывающиеся до и после поиска, поле ввода, элемент ошибки
   const sectionAfterSearch = document.querySelector(HTMLClasses.sectionAfterSearch);
   const searchField = document.querySelector(HTMLClasses.searchField);
   const errorElem = document.querySelector(HTMLClasses.searchError);

   if (searchField.value.length > 0 && searchField.value.length < 3) { // Если в поле поиска введено менее 3 символов
      if (!sectionBeforeSearch.classList.contains("not-displayed")) sectionBeforeSearch.classList.add("not-displayed"); // Прячем категории
   }
   else if (searchField.value.length >= 3) { // Если введено 3 или более символов
      const searchQuery = searchField.value.replace(/ /gi, "%20");   // Заменяем пробелы в строке
      const searchResult = await getResultSearch(searchQuery); // И отправляем запрос

      if (searchResult.tracks.items.length === 0   // Если совсем ничего не найдено – выводим ошибку
         && searchResult.playlists.items.length === 0
         && searchResult.artists.items.length === 0
         && searchResult.albums.items.length === 0) {
         if (errorElem.classList.contains("not-displayed")) errorElem.classList.remove("not-displayed");
         if (!sectionAfterSearch.classList.contains("not-displayed")) sectionAfterSearch.classList.add("not-displayed");

      } else { // Иначе выводи результаты
         if (!errorElem.classList.contains("not-displayed")) errorElem.classList.add("not-displayed");   // Прячем сообщение об ошибке, если оно отображалось

         setTracks(searchResult.tracks.items);  // Вставляем результаты на страницу соответствующими функциями
         setPlaylists(searchResult.playlists.items);
         setArtists(searchResult.artists.items);
         setAlbums(searchResult.albums.items);
         setBestResult(searchResult.artists.items[0], searchResult.tracks.items[0]);
         // И показываем секцию с результатами (если она была скрыта)
         if (sectionAfterSearch.classList.contains("not-displayed")) sectionAfterSearch.classList.remove("not-displayed");
      } 
   }
   else {   // Если пользователь стер все символы, то показываем категории
      if (sectionBeforeSearch.classList.contains("not-displayed")) sectionBeforeSearch.classList.remove("not-displayed");
      if (!sectionAfterSearch.classList.contains("not-displayed")) sectionAfterSearch.classList.add("not-displayed");
   }
}

/**
 * Отображение треков соответствующих запросу
 * @param {array} tracks - массив треков из результатов запроса
 */
function setTracks(tracks) {
   const tracksItems = document.querySelectorAll(HTMLClasses.trackItem);   // Получаем все элементы, куда будем выводить
   for (let i = 0; i < tracksItems.length; i++){   // Обходим каждый
      if (tracks[i] != undefined) { // Если в результате запроса есть очередной трек который можно вывести

         // Если элемент в который хотим вывести очередной трек скрыт, то показываем его
         if (tracksItems[i].classList.contains("not-displayed")) tracksItems[i].classList.remove("not-displayed");   

         const img = tracksItems[i].querySelector(HTMLClasses.trackItemImg);  // Находим изображение элемента, его название и т.д.
         const songName = tracksItems[i].querySelector(HTMLClasses.trackItemName);
         const author = tracksItems[i].querySelector(HTMLClasses.trackItemAuthor);
         const timeElem = tracksItems[i].querySelector(HTMLClasses.trackItemTime);
         const timeInSec = tracks[i].duration_ms / 1000; // Длительность трека в секундах

         // Выводим результаты запроса
         if (tracks[i].album.images[0]?.url) img.setAttribute("src", tracks[i].album.images[0].url);  // Изображение у трека может отсутствовать
         songName.textContent = tracks[i].name;
         author.textContent = tracks[i].artists[0].name;
         timeElem.textContent = `${Math.floor(timeInSec / 60)}:${Math.floor(timeInSec % 60) < 10 ? "0" + Math.floor(timeInSec % 60) : Math.floor(timeInSec % 60)}`;
      }
      else tracksItems[i].classList.add("not-displayed"); // Если очередного трека для вывода нет, то скрываем лишний элемент
   }
}

/**
 * Отображение плейлистов соответствующих запросу, по аналогии setTracks
 * @param {array} playlists - массив плейлистов из результатов запроса
 */
function setPlaylists(playlists) { 
   const playlistsRow = document.querySelector(HTMLClasses.playlistsRow);  // Строка с плейлистами

   if (playlists.length != 0) {  // Если есть плейлисты для вывода, то производим действия по аналогии с setTracks
      if (playlistsRow.classList.contains("not-displayed")) playlistsRow.classList.remove("not-displayed"); // Если строка с плейлистами скрыта – показываем её

      const playlistsItems = playlistsRow.querySelectorAll(HTMLClasses.rowItem);

      for (let i = 0; i < playlistsItems.length; i++){
         if (playlists[i] != undefined) {
            if (playlistsItems[i].classList.contains("not-displayed")) playlistsItems[i].classList.remove("not-displayed");
            const img = playlistsItems[i].querySelector(HTMLClasses.rowItemImg);
            const title = playlistsItems[i].querySelector(HTMLClasses.rowItemTitle);
            const description = playlistsItems[i].querySelector(HTMLClasses.rowItemDescription);

            if (playlists[i].images[0]?.url) img.setAttribute("src", playlists[i].images[0].url);
            title.textContent = playlists[i].name;
            description.textContent = playlists[i].description;
            playlistsItems[i].setAttribute("href", playlists[i].external_urls.spotify)
         }
         else playlistsItems[i].classList.add("not-displayed");
      }
   }
   else playlistsRow.classList.add("not-displayed");  // Если плейлистов для вывода нет, то скрываем всю строку
}

/**
 * Отображение исполнителей соответствующих запросу, по аналогии setPlaylists
 * @param {array} artists - массив исполнителей из результатов запроса
 */
function setArtists(artists) {  
   const artistsRow = document.querySelector(HTMLClasses.artistsRow);

   if (artists.length != 0) {
      if (artistsRow.classList.contains("not-displayed")) artistsRow.classList.remove("not-displayed");

      const artistsItems = artistsRow.querySelectorAll(HTMLClasses.rowItem);

      for (let i = 0; i < artistsItems.length; i++) {
         if (artists[i] != undefined) {
            if (artistsItems[i].classList.contains("not-displayed")) artistsItems[i].classList.remove("not-displayed");
            const img = artistsItems[i].querySelector(HTMLClasses.rowItemImg);
            const title = artistsItems[i].querySelector(HTMLClasses.rowItemTitle);

            if (artists[i].images[0]?.url) img.setAttribute("src", artists[i].images[0].url);
            title.textContent = artists[i].name;
            artistsItems[i].setAttribute("href", artists[i].external_urls.spotify);
         }
         else artistsItems[i].classList.add("not-displayed");
      }
   }
   else artistsRow.classList.add("not-displayed");
}

/**
 * Отображение альбомов соответствующих запросу, по аналогии setPlaylists
 * @param {array} albums - массив альбомов из результатов запроса
 */
function setAlbums(albums) { 
   const albumsRow = document.querySelector(HTMLClasses.albumsRow);

   if (albums.length != 0) {
      if (albumsRow.classList.contains("not-displayed")) albumsRow.classList.remove("not-displayed");

      const albumsItems = albumsRow.querySelectorAll(HTMLClasses.rowItem);

      for (let i = 0; i < albumsItems.length; i++) {
         if (albums[i] != undefined) {
            if (albumsItems[i].classList.contains("not-displayed")) albumsItems[i].classList.remove("not-displayed");
            const img = albumsItems[i].querySelector(HTMLClasses.rowItemImg);
            const title = albumsItems[i].querySelector(HTMLClasses.rowItemTitle);
            const description = albumsItems[i].querySelector(HTMLClasses.rowItemDescription);

            if (albums[i].images[0]?.url) img.setAttribute("src", albums[i].images[0].url);
            title.textContent = albums[i].name;
            description.textContent = `${albums[i].release_date.slice(0, 4)} • ${albums[i].artists[0].name}`;
            albumsItems[i].setAttribute("href", albums[i].external_urls.spotify);
         }
         else albumsItems[i].classList.add("not-displayed");
      }
   }
   else albumsRow.classList.add("not-displayed");
}

/**
 * Отображение результата (исполнителя или трека), который лучше всего соответствует результату запроса
 * @param {object} artist - первый элемент массива исполнителей из результата запроса
 * @param {object} track - первый элемент массива треков из результата запроса
 */
function setBestResult(artist, track) {
   const bestResult = document.querySelector(`${HTMLClasses.searchBestResult} ${HTMLClasses.rowItem}`);  // Элемент лучшего результата и его заголовок, изображение, описание
   const img = bestResult.querySelector(HTMLClasses.rowItemImg);
   const title = bestResult.querySelector(HTMLClasses.rowItemTitle);
   const description = bestResult.querySelector(HTMLClasses.rowItemDescription);

   if (artist != undefined && track != undefined) {   // Если существует и исполнитель и трек, то выбираем что из них популярнее и выводим это
      if (artist.popularity > track.popularity) {
         if (artist.images[0]?.url) img.setAttribute("src", artist.images[0].url);
         title.textContent = artist.name;
         description.textContent = "";
         bestResult.setAttribute("href", artist.external_urls.spotify);
      }
      else {
         if (track.album.images[0]?.url) img.setAttribute("src", track.album.images[0].url);  // Изображение у трека может отсутствовать
         title.textContent = track.name;
         description.textContent = track.artists[0].name;
         bestResult.setAttribute("href", track.external_urls.spotify);
      }
   }
   else if (artist === undefined && track != undefined) { // Если исполнитель не существует, то выводим информацию о треке
      if (track.album.images[0]?.url) img.setAttribute("src", track.album.images[0].url);  // Изображение у трека может отсутствовать
      title.textContent = track.name;
      description.textContent = track.artists[0].name;
      bestResult.setAttribute("href", track.external_urls.spotify);
   }
   else if (track === undefined && artist != undefined) {  // Если трек не существует, то выводи информацию о исполнителе
      if (artist.images[0]?.url) img.setAttribute("src", artist.images[0].url);
      title.textContent = artist.name;
      description.textContent = "";
      bestResult.setAttribute("href", artist.external_urls.spotify);
   }
}

/**
 * Очистка поля поиска
 */
function clearSearchField() {
   const sectionBeforeSearch = document.querySelector(HTMLClasses.sectionBeforeSearch);
   const sectionAfterSearch = document.querySelector(HTMLClasses.sectionAfterSearch);
   const searchField = document.querySelector(HTMLClasses.searchField);

   searchField.value = "";

   // При очистке скрываются результаты последнего поиска и показываются категории
   if (sectionBeforeSearch.classList.contains("not-displayed")) sectionBeforeSearch.classList.remove("not-displayed");  
   if (!sectionAfterSearch.classList.contains("not-displayed")) sectionAfterSearch.classList.add("not-displayed");
}

document.addEventListener("DOMContentLoaded", init);
document.querySelector(HTMLClasses.searchField).addEventListener("input", search);
document.querySelector(".header__search-close-icon").addEventListener("click", clearSearchField);
