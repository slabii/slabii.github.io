import { SEQUENCES } from 'https://slabii.github.io/sequences.js';
import { SCORE } from './score.js';
import { SCALED_SCORES } from './scaled-scores.js';

globalThis.STATE = {
  submitted: false,
  prompt: null,
  SCORE,
  maskTimeout: null,
  submissionValue: '',
};

const $ = document.querySelector.bind(document);
const $$ = function (selector) {
  return [...document.querySelectorAll(selector)];
};

document.addEventListener('DOMContentLoaded', main);

async function waitFor(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function main() {
  updateTable();

  setupMaskedInput();

  $('#years').addEventListener('input', updateTable);

  $('#submit-and-continue').addEventListener('click', () => {
    STATE.submitted = true;
    $('#submit-and-continue').disabled = true;
  });
  $('#play').addEventListener('click', async () => {
    if ($('#play').dataset.clicked === 'true') {
      return;
    }

    $('#play').dataset.clicked = 'true';
    $('#play').disabled = true;
    $('#submit-and-continue').disabled = true;
    // Begin test
    await runTest();
  });
}

async function runTest() {
  /** Forward. */
  STATE.prompt = "I will now say some numbers. Listen attentively since I can't repeat them. Whenever I've finished saying them, I ask that you type them in the box below in the same order that I told them to you.";
  await speak(STATE.prompt, 0.75);

  let forwardWrongStreak = 0;
  FORWARD: for (const [i, sequence] of Object.entries(SEQUENCES.FORWARD)) {
    for (const digit of sequence) {
      await speak(digit, 1.0);
    }
    const submission = await waitForSubmission();
    const isCorrect = submission === sequence.join('');
    STATE.SCORE.FORWARD += isCorrect;
    updateTable();

    if (isCorrect) {
      forwardWrongStreak = 0;
    } else {
      forwardWrongStreak++;
      if (forwardWrongStreak === 2) {
        console.log('2 wrong answers in a row. Ending FORWARD subtest.');
        break FORWARD;
      }
    }
  }

  /** Backward. */
  STATE.prompt = "I will now say more numbers, but this time I'll ask you to repeat them in reverse order. If I were to say 7 1, what would you tell me?";
  await speak(STATE.prompt, 0.75);

  await performPracticeRound("BACKWARD", "17", "7 1", "1 7");

  let backwardWrongStreak = 0;
  BACKWARD: for (const [i, sequence] of Object.entries(SEQUENCES.BACKWARD)) {
    for (const digit of sequence) {
      await speak(digit, 1.0);
    }
    const submission = await waitForSubmission();
    const isCorrect = submission === sequence.reverse().join('');
    STATE.SCORE.BACKWARD += isCorrect;
    updateTable();

    if (isCorrect) {
      backwardWrongStreak = 0;
    } else {
      backwardWrongStreak++;
      if (backwardWrongStreak === 2) {
        console.log('2 wrong answers in a row. Ending BACKWARD subtest.');
        break BACKWARD;
      }
    }
  }

  /** Sequencing. */
  STATE.prompt = 'I will now say more numbers. After I say them I will ask that you repeat them to me in order, beginning with the smallest number. If I tell you 2 3 1, what would you tell me?';
  await speak(STATE.prompt, 0.75);

  await performPracticeRound("SEQUENCING", "123", "2 3 1", "1 2 3");

  let sequencingWrongStreak = 0;
  SEQUENCING: for (const [i, sequence] of Object.entries(SEQUENCES.SEQUENCING)) {
    for (const digit of sequence) {
      await speak(digit, 1.0);
    }
    const submission = await waitForSubmission();
    const isCorrect = submission === sequence.sort().join('');
    STATE.SCORE.SEQUENCING += isCorrect;
    updateTable();

    if (isCorrect) {
      sequencingWrongStreak = 0;
    } else {
      sequencingWrongStreak++;
      if (sequencingWrongStreak === 2) {
        console.log('2 wrong answers in a row. Ending SEQUENCING subtest.');
        break SEQUENCING;
      }
    }
  }

  endTest();
}

async function performPracticeRound(type, correctAnswer, originalPrompt, correctResponse) {
  $('#play').disabled = false;
  $('#play').textContent = 'REPEAT';

  const practice1 = await waitForSubmission();
  if (practice1 === correctAnswer) {
    await speak("That's correct.", 0.75);
  } else {
    await speak(`That is not correct. I said ${originalPrompt}, for which in reverse order the correct response was ${correctResponse}.`, 0.75);
  }

  STATE.prompt = `Let's try again. Remember to say them in reverse order. ${type === 'BACKWARD' ? '3 4' : '5 2 2'}.`;
  await speak(STATE.prompt, 0.75);
  $('#play').disabled = false;

  const practice2 = await waitForSubmission();
  if (practice2 === (type === 'BACKWARD' ? '43' : '225')) {
    await speak("That's correct, let's do some more.", 0.75);
  } else {
    await speak(`That is not correct. I said ${type === 'BACKWARD' ? '3 4' : '5 2 2'}, for which the correct response was ${type === 'BACKWARD' ? '4 3' : '2 2 5'}. Let's do some more.`, 0.75);
  }
}

function endTest() {
  $('#play').disabled = true;
  $('#submission').disabled = true;
  $('#submit-and-continue').disabled = true;
  $('#pseudo-submission').classList.add('test-complete');

  sendScoreToDatabase();
}

function speak(text, speed = 1, lang = 'en-US') {
  $('#play').disabled = true;
  $('#submission').disabled = true;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = $('#lang').value || 'en-US';
  utterance.rate = speed;

  return new Promise((resolve) => {
    utterance.addEventListener('end', resolve);
    speechSynthesis.speak(utterance);
  });
}

async function waitForSubmission() {
  $('#submission').disabled = false;
  $('#pseudo-submission').focus();
  $('#submit-and-continue').disabled = false;
  while (true) {
    await waitFor(0);
    if (STATE.submitted) {
      STATE.submitted = false;
      const submission = $('#submission').value.trim();
      $('#submission').value = '';
      return submission;
    }
  }
}

function updateTable() {
  const years = Number($('#years').value);
  for (const category of ['FORWARD', 'BACKWARD', 'SEQUENCING', 'OVERALL']) {
    const { children: tds } = $(`tr[name="${category.toLowerCase()}"]`);
    tds[1].textContent = STATE.SCORE[category];
    tds[2].textContent = STATE.SCORE.getIQ(years, category);
  }

  $('tr[name="scaled"] > td:last-child').textContent = rawToScaled(years, STATE.SCORE.OVERALL);
}

function rawToScaled(years, raw) {
  const key = Object.keys(SCALED_SCORES).find(key => {
    const [from, to] = key.split('-').map(Number);
    return years >= from && years <= to;
  });

  const scaledScores = SCALED_SCORES[key];

  const scaledScore = scaledScores.findIndex((value) => {
    const range = Array.isArray(value) ? value : [value, value];
    const [min, max] = range;
    return raw >= min && raw <= max;
  }) + 1;

  return scaledScore;
}

function setupMaskedInput() {
  setInterval(() => {
    if ($('#submission').disabled) {
      $('#pseudo-submission').innerHTML = '&nbsp;';
      $('#pseudo-submission').contentEditable = false;
    } else if ($('#pseudo-submission').contentEditable === 'false') {
      $('#pseudo-submission').contentEditable = true;
      focusContentEditable($('#pseudo-submission'));
    }
  }, 500);

  $('#pseudo-submission').addEventListener('keydown', function (evt) {
    if (evt.key === 'Enter') {
      $('#submit-and-continue').click();
      evt.preventDefault();
      return;
    }
  });

  $('#pseudo-submission').addEventListener('input', function (evt) {
    $('#submission').value = this.textContent;

    this.textContent = this.textContent;

    const lastChar = document.createElement('span');

    clearTimeout(STATE.maskTimeout);

    STATE.maskTimeout = setTimeout(() => {
      lastChar.style.fontFamily = 'Password';
    }, 500);

    if (STATE.submissionValue.length < this.textContent.length) {
      lastChar.classList.add('visible-digit');
    }
    const child = this.firstChild?.splitText(this.textContent.length - 1);
    child && lastChar.appendChild(child);

    this.appendChild(lastChar);

    const range = document.createRange();
    range.selectNodeContents(this);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    STATE.submissionValue = this.textContent;
  });
}

function focusContentEditable(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(el.childNodes[0], 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}
       
function sendScoreToDatabase() {
  const isAuthenticated = document.querySelector('meta[name="authenticated"]').getAttribute('content') === 'true';
  
  const ss = rawToScaled(Number($('#years').value), STATE.SCORE.OVERALL);

  if (isAuthenticated) {
    const scoreData = {
      overallScore: ss
    };

    fetch('/test_results/digit-span', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoreData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
  }
}
