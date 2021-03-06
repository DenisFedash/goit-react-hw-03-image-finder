import { Component } from 'react';
import { Searchbar } from './Searchbar/Searchbar';
import fetchImages from '../services/api';
import { ImageGallery } from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import { Loader } from './Loader/Loader';
import Modal from './Modal/Modal';
import { Message } from './Message/Message';

const getArrayImages = hits => {
  return hits.map(({ id, tags, webformatURL, largeImageURL }) => ({
    id: id,
    description: tags,
    smallImage: webformatURL,
    largeImage: largeImageURL,
  }));
};

export class App extends Component {
  state = {
    query: '',
    page: 1,
    imagesOnPage: 0,
    totalImages: 0,
    isLoading: false,
    showModal: false,
    images: null,
    error: null,
    currentImageUrl: null,
    currentImageDescription: null,
  };

  onChangeSearch = query => {
    this.setState({
      images: [],
      currentPage: 1,
      search: query,
    });
  };

  getImages = () => {
    const { pages, search } = this.state;

    this.setState({
      isLoading: true,
    });

    fetchImages(search, pages)
      .then(images => {
        this.setState(prevState => ({
          images: [...prevState.images, ...images.hits],
          pages: prevState.pages + 1,
        }));
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  componentDidUpdate(prevProps, prevState) {
    const { query, page } = this.state;

    if (prevState.query !== query) {
      this.setState(({ isLoading }) => ({ isLoading: !isLoading }));

      fetchImages(query)
        .then(({ hits, totalHits }) => {
          const imagesArray = getArrayImages(hits);

          return this.setState({
            page: 1,
            images: imagesArray,
            imagesOnPage: imagesArray.length,
            totalImages: totalHits,
          });
        })
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isLoading: false }));
    }

    if (prevState.page !== page && page !== 1) {
      this.setState(({ isLoading }) => ({ isLoading: !isLoading }));

      fetchImages(query, page)
        .then(({ hits }) => {
          const imagesArray = getArrayImages(hits);

          return this.setState(({ images, imagesOnPage }) => {
            return {
              images: [...images, ...imagesArray],
              imagesOnPage: imagesOnPage + imagesArray.length,
            };
          });
        })
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isLoading: false }));
    }
  }

  getSearchRequest = query => {
    this.setState({ query });
  };

  onNextFetch = () => {
    this.setState(({ page }) => ({ page: page + 1 }));
  };

  toggleModal = () => {
    this.setState(({ showModal }) => ({ showModal: !showModal }));
  };

  openModal = e => {
    const currentImageUrl = e.target.dataset.large;
    const currentImageDescription = e.target.alt;

    if (e.target.nodeName === 'IMG') {
      this.setState(({ showModal }) => ({
        showModal: !showModal,
        currentImageUrl: currentImageUrl,
        currentImageDescription: currentImageDescription,
      }));
    }
  };

  render() {
    const {
      images,
      imagesOnPage,
      totalImages,
      isLoading,
      showModal,
      currentImageUrl,
      currentImageDescription,
    } = this.state;

    return (
      <>
        <Searchbar onSubmit={this.getSearchRequest} />
        {totalImages < 1 && (
          <Message>
            <h2>The gallery is empty ????</h2>
            <p>Use search field!</p>
          </Message>
        )}
        {images && <ImageGallery openModal={this.openModal} images={images} />}
        {isLoading && <Loader />}
        {imagesOnPage >= 12 && imagesOnPage < totalImages && (
          <Button onNextFetch={this.onNextFetch} />
        )}
        {showModal && (
          <Modal
            onClose={this.toggleModal}
            currentImageUrl={currentImageUrl}
            currentImageDescription={currentImageDescription}
          />
        )}
      </>
    );
  }
}
