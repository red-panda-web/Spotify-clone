import {getCategories, getPlaylists} from "./spotifyAPI.js";

const HTMLClasses = {
   playlistsRow: ".main__row", // Строчка с плейлистами
   playlistsRowTitle: ".main__row-link",   // Заголовок строчки
   playlistItem: ".main__item_rect",   // Элемент строчки (плейлист)
   playlistItemImg: ".main__item-img",  // Картинка плейлиста
   playlistItemTitle: ".main__item-title", // Название плейлиста
   playlistItemDescription: ".main__item-description", // Описание плейлиста
}

/**
 * Показ плейлистов по категориям при загрузке страницы
 * @async
 */
async function init() {
   const playlistsRows = document.querySelectorAll(HTMLClasses.playlistsRow);  // Строчки с плейлистами
   if (playlistsRows) {
      const categories = await getCategories(playlistsRows.length);  // Получаем объект с категориями, количество категорий: 1 строчка с плейлистами = 1 категория
      for (let i = 0; i < playlistsRows.length; i++){ // Обходим каждую строчку
         const rowItems = playlistsRows[i].querySelectorAll(HTMLClasses.playlistItem); // Все элементы строки
         // Получаем объект с плейлистами по заданной категории, количество плейлистов: 1 плейлист = 1 элемент строки
         const playlists = await getPlaylists(categories.items[i].id, rowItems.length); 

         const rowTitle = playlistsRows[i].querySelector(HTMLClasses.playlistsRowTitle);  // В заголовок строки вставляем название категории
         rowTitle.textContent = categories.items[i].name;

         for (let j = 0; j < rowItems.length; j++){   // Обходим каждый элемент строки
            const itemImg = rowItems[j].querySelector(HTMLClasses.playlistItemImg); // Находим картинку, заголовок и описание элемента
            const itemTitle = rowItems[j].querySelector(HTMLClasses.playlistItemTitle);
            const itemDesc = rowItems[j].querySelector(HTMLClasses.playlistItemDescription);

            itemImg.setAttribute("src", playlists.items[j].images[0].url);   // И заполняем данными из соответствующего плейлиста
            itemTitle.textContent = playlists.items[j].name;
            itemDesc.textContent = playlists.items[j].description;
            rowItems[j].setAttribute("href", playlists.items[j].external_urls.spotify)   // Дополнительно устанавливаем элементу ссылку на оригинальный сайт
         }
      }
   }
}

document.addEventListener("DOMContentLoaded", init)