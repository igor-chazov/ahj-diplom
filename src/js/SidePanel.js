import DOM from './DOM';

export default class SidePanel {
  constructor(element, messageClass, requestClass) {
    this.parentElement = element;
    this.listElement = this.parentElement.querySelector('.chaos_side_list');

    this.messageClass = messageClass;
    this.request = requestClass;

    this.render = this.render.bind(this);
    this.closeCategory = this.closeCategory.bind(this);
    this.showCategoryItems = this.showCategoryItems.bind(this);
    this.showFavouritesDescription = this.showFavouritesDescription.bind(this);

    this.categoryItems = {
      links: { class: 'chaos_side_links', text: 'Ссылки', handler: DOM.createSideLinkElement },
      favourites: { class: 'chaos_side_favourites', text: 'Избранное', handler: DOM.createSideFavouriteElement },
      image: { class: 'chaos_side_images', text: 'Изображения', handler: DOM.createSideImageElement },
      file: { class: 'chaos_side_files', text: 'Файлы', handler: DOM.createSideFileElement },
      video: { class: 'chaos_side_videos', text: 'Видео', handler: DOM.createSideVideoElement },
      audio: { class: 'chaos_side_audios', text: 'Аудио', handler: DOM.createSideAudioElement },
    };
  }

  render(data) {
    this.listElement.innerHTML = '';

    // eslint-disable-next-line guard-for-in
    for (const type in data) {
      const sideElement = DOM.createSideElement(
        this.categoryItems[type].class, this.categoryItems[type].text, data[type],
      );
      this.listElement.append(sideElement);
      if (data[type] > 0) {
        sideElement.addEventListener('click', () => this.requestCategoryItems(type));
      }
    }
  }

  requestCategoryItems(type) {
    if (type === 'favourites') {
      this.category = 'favourites';
      this.openCategory(this.categoryItems[type].text);
      while (this.messageClass.messagesElement.firstChild) {
        this.messageClass.messagesElement.removeChild(this.messageClass.messagesElement.firstChild);
      }
      this.messageClass.messages.clear();
      this.request.send('favouritesLoad');
      return;
    }

    this.openCategory(this.categoryItems[type].text);
    this.request.send('storage', type);
  }

  openCategory(text) {
    const subheadElement = DOM.createSideSubheadElement(text);
    const closeElement = subheadElement.querySelector('.chaos_side_close');
    this.listElement.replaceWith(subheadElement);
    closeElement.addEventListener('click', this.closeCategory);
  }

  closeCategory() {
    this.parentElement.querySelector('.chaos_side_subhead').remove();
    this.parentElement.querySelector('.chaos_side_list').remove();

    if (this.category === 'favourites') {
      while (this.messageClass.messagesElement.firstChild) {
        this.messageClass.messagesElement.removeChild(this.messageClass.messagesElement.firstChild);
      }
      this.messageClass.messages.clear();
      this.request.send('load');
      this.parentElement.append(this.listElement);
      this.category = '';
      return;
    }

    this.parentElement.append(this.listElement);
    this.messageClass.closeSelectMessage();
  }

  showCategoryItems(data) {
    const categoryListElement = DOM.createSideCategoryList();
    for (const item of data.data) {
      const categoryElement = this.categoryItems[data.category]
        .handler(item.name, this.request.server);
      categoryListElement.append(categoryElement);
      categoryElement.querySelector('.chaos_side_open_select').addEventListener('click', () => this.request.send('select', item.messageId));
    }
    this.parentElement.append(categoryListElement);
  }

  showFavouritesDescription(data) {
    const categoryListElement = DOM.createSideCategoryList();
    const descriptionElement = DOM.createFavouritesDescription(
      data.length, data[data.length - 1].date, data[0].date,
    );
    categoryListElement.append(descriptionElement);
    this.parentElement.append(categoryListElement);
  }
}
