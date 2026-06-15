const form = document.querySelector('#waitlist-form');
const releasedRadios = document.querySelectorAll('input[name="released"]');
const spotifySection = document.querySelector('#spotify-section');
const songSection = document.querySelector('#song-section');
const spotifyInput = document.querySelector('#spotify-profile');
const songInput = document.querySelector('#song-file');

const spotifyArtistUrlPattern = /^https:\/\/open\.spotify\.com\/artist\/[A-Za-z0-9]+(?:[/?#].*)?$/;

function setSectionState(section, isVisible) {
  section.classList.toggle('conditional-section--visible', isVisible);
  section.setAttribute('aria-hidden', String(!isVisible));
}

function updateSelectedRadioState() {
  releasedRadios.forEach((radio) => {
    radio.closest('.radio-card').classList.toggle('radio-card--selected', radio.checked);
  });
}

function updateConditionalFields() {
  const releasedMusic = form.elements.released.value;
  const isReleased = releasedMusic === 'yes';
  const isUnreleased = releasedMusic === 'no';

  updateSelectedRadioState();
  setSectionState(spotifySection, isReleased);
  setSectionState(songSection, isUnreleased);

  spotifyInput.required = isReleased;
  songInput.required = isUnreleased;

  if (!isReleased) {
    spotifyInput.value = '';
    spotifyInput.setCustomValidity('');
  }

  if (!isUnreleased) {
    songInput.value = '';
    songInput.setCustomValidity('');
  }
}

function validateSpotifyProfile() {
  if (!spotifyInput.required || spotifyArtistUrlPattern.test(spotifyInput.value.trim())) {
    spotifyInput.setCustomValidity('');
    return true;
  }

  spotifyInput.setCustomValidity('Please enter a valid Spotify Artist Profile URL.');
  return false;
}

function buildSubmission() {
  const formData = new FormData(form);
  const songFile = songInput.files[0];

  return {
    fullName: formData.get('fullName'),
    artistName: formData.get('artistName'),
    email: formData.get('email'),
    phoneNumber: formData.get('phone'),
    socialAccounts: formData.get('socials'),
    youtubeChannel: formData.get('youtube'),
    releasedMusic: formData.get('released'),
    spotifyArtistProfile: formData.get('released') === 'yes' ? formData.get('spotifyArtistProfile') : '',
    songFileUrl: formData.get('released') === 'no' && songFile ? URL.createObjectURL(songFile) : '',
    songFileName: formData.get('released') === 'no' && songFile ? songFile.name : '',
    submissionDate: new Date().toISOString(),
  };
}

releasedRadios.forEach((radio) => {
  radio.addEventListener('change', updateConditionalFields);
});

spotifyInput.addEventListener('input', validateSpotifyProfile);
updateConditionalFields();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateConditionalFields();

  if (!validateSpotifyProfile() || !form.reportValidity()) {
    return;
  }

  const submissions = JSON.parse(localStorage.getItem('solvaroWaitlistSubmissions') || '[]');
  submissions.push(buildSubmission());
  localStorage.setItem('solvaroWaitlistSubmissions', JSON.stringify(submissions));

  window.location.href = 'thanks.html';
});