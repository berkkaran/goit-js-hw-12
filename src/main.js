import './init';
import './css/styles.css';
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '48258923-bff14545616bbf92759f2c80c';
const BASE_URL = 'https://pixabay.com/api/';

const searchForm = document.querySelector('#searchForm');
const galleryImages = document.querySelector('#gallery');
const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('#load-more');
const loadMoreLoader = document.querySelector('.load-more-loader');

let query = '';
let currentPage = 1;
const perPage = 40;

loader.style.display = 'none';
loadMoreButton.style.display = 'none';
loadMoreLoader.style.display = 'none';

async function fetchImages() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });

    const images = response.data.hits;
    const totalHits = response.data.totalHits;

    if (images.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    if (currentPage * perPage >= totalHits) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
      loadMoreButton.style.display = 'none';
      return;
    }

    const markup = images
      .map(
        ({
          largeImageURL,
          webformatURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `
          <div class="image-card">
            <a href="${largeImageURL}" class="gallery-link" data-lightbox="gallery">
              <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
            </a>
            <div class="info">
              <p><span>Likes:</span> ${likes}</p>
              <p><span>Views:</span> ${views}</p>
              <p><span>Comments:</span> ${comments}</p>
              <p><span>Downloads:</span> ${downloads}</p>
            </div>
          </div>
        `
      )
      .join('');

    galleryImages.insertAdjacentHTML('beforeend', markup);

    const lightbox = new SimpleLightbox('.gallery-link', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    lightbox.refresh();

    if (currentPage * perPage < totalHits) {
      loadMoreButton.style.display = 'block';
    }

    smoothScroll();
  } catch (error) {
    console.log(error);
  } finally {
    loader.style.display = 'none';
    loadMoreLoader.style.display = 'none';
  }
}

searchForm.addEventListener('submit', async event => {
  event.preventDefault();

  query = document.querySelector('#form-input').value.trim();
  if (!query) {
    iziToast.error({
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  currentPage = 1;
  galleryImages.innerHTML = '';
  loadMoreButton.style.display = 'none';
  loader.style.display = 'inline-block';

  await fetchImages();
});

loadMoreButton.addEventListener('click', async () => {
  loadMoreLoader.style.display = 'inline-block';
  currentPage += 1;
  await fetchImages();
});

function smoothScroll() {
  const cardHeight = document
    .querySelector('.gallery-link')
    .getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
