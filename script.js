```js
const supabaseUrl = "https://eskrabhfpxnpoqnpieou.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_c7y_c6oeVpFK53zlvQCaLQ_m-RUVw1a";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const form = document.querySelector('#waitlist-form');
const releasedRadios = document.querySelectorAll('input[name="released"]');
const spotifySection = document.querySelector('#spotify-section');
const songSection = document.querySelector('#song-section');
const spotifyInput = document.querySelector('#spotify-profile');
const songInput = document.querySelector('#song-file');

const spotifyArtistUrlPattern =
  /^https:\/\/open\.spotify\.com\/artist\/[A-Za-z0-9]+(?:[/?#].*)?$/;

function setSectionState(section, isVisible) {
  section.classList.toggle(
    'conditional-section--visible',
    isVisible
  );

  section.setAttribute(
    'aria-hidden',
    String(!isVisible)
  );
}

function updateSelectedRadioState() {
  releasedRadios.forEach((radio) => {
    const card = radio.closest('.radio-card');

    if (card) {
      card.classList.toggle(
        'radio-card--selected',
        radio.checked
      );
    }
  });
}

function updateConditionalFields() {
  const releasedMusic = form.elements.released.value;

  const isReleased = releasedMusic === 'yes';
  const isUnreleased = releasedMusic === 'no';

  updateSelectedRadioState();

  setSectionState(
    spotifySection,
    isReleased
  );

  setSectionState(
    songSection,
    isUnreleased
  );

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
  if (
    !spotifyInput.required ||
    spotifyArtistUrlPattern.test(
      spotifyInput.value.trim()
    )
  ) {
    spotifyInput.setCustomValidity('');
    return true;
  }

  spotifyInput.setCustomValidity(
    'Please enter a valid Spotify Artist Profile URL.'
  );

  return false;
}

releasedRadios.forEach((radio) => {
  radio.addEventListener(
    'change',
    updateConditionalFields
  );
});

spotifyInput.addEventListener(
  'input',
  validateSpotifyProfile
);

updateConditionalFields();

form.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();

    updateConditionalFields();

    if (
      !validateSpotifyProfile() ||
      !form.reportValidity()
    ) {
      return;
    }

    const submitButton =
      form.querySelector('button[type="submit"]');

    const originalButtonText =
      submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent =
      'Submitting...';

    try {
      const formData =
        new FormData(form);

      const songFile =
        songInput.files[0];

      let songUrl = null;

      if (
        formData.get('released') === 'no' &&
        songFile
      ) {
        const fileName =
          `${Date.now()}-${songFile.name}`;

        const { error: uploadError } =
          await supabaseClient.storage
            .from('songs')
            .upload(
              fileName,
              songFile
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data } =
          supabaseClient.storage
            .from('songs')
            .getPublicUrl(
              fileName
            );

        songUrl =
          data.publicUrl;
      }

      const { error } =
        await supabaseClient
          .from('waitlist')
          .insert([
            {
              full_name:
                formData.get(
                  'fullName'
                ),

              artist_name:
                formData.get(
                  'artistName'
                ),

              email:
                formData.get(
                  'email'
                ),

              phone:
                formData.get(
                  'phone'
                ),

              socials:
                formData.get(
                  'socials'
                ),

              youtube:
                formData.get(
                  'youtube'
                ),

              released:
                formData.get(
                  'released'
                ),

              spotify_artist_profile:
                formData.get(
                  'spotifyArtistProfile'
                ) || null,

              song_url:
                songUrl,

              created_at:
                new Date().toISOString()
            }
          ]);

      if (error) {
        throw error;
      }

      window.location.href =
        'thanks.html';

    } catch (error) {

      console.error(error);

      alert(
        'Submission failed. Please try again.'
      );

    } finally {

      submitButton.disabled =
        false;

      submitButton.textContent =
        originalButtonText;
    }
  }
);
```
