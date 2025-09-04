$(document).ready(function () {
  // Toggle sekcji
  $('#toggle-sections').click(function () {
    $('.skills-section, .weapons-container, .armor-container, .spells-section').toggleClass('hidden');
    const isHidden = $('.skills-section').hasClass('hidden');
    $(this).text(isHidden ? 'Pokaż sekcje dodawania' : 'Ukryj sekcje dodawania');
  });

  // Dodawanie umiejętności z opisem
  $('.skills-section .add-btn').click(function () {
    const name = $('.skills-section input[type="text"]').eq(0).val().trim();
    const percent = $('.skills-section input[type="number"]').val().trim();
    const desc = $('.skills-section input[type="text"]').eq(1).val().trim();
    if (name && percent !== '') {
      const li = $(`<li>${name} (${desc}) — ${percent}% <span class="delete-btn">🗑</span></li>`);
      li.find('.delete-btn').click(() => li.remove());
      $('.skills-list').append(li);
      $('.skills-section input').val('');
    }
  });

  $('.weapons-container .add-btn').click(function () {
    const name = $('.weapons-container input[type="text"]').eq(0).val().trim();
    const basePercent = parseInt($('.weapons-container input[type="number"]').val().trim()) || 0;
    const type = $('.weapons-container input[type="text"]').eq(1).val().trim().toLowerCase();

    const combatSkills = ['heavy weapon', 'energy weapon', 'firearm', 'missile weapon', 'melee weapon'];

    const skills = $('.skills-list li').toArray().map(li => {
      const text = $(li).text().toLowerCase();
      const match = text.match(/(.+?)\s*—\s*(\d+)/);
      return match ? { name: match[1].trim(), percent: parseInt(match[2]) } : null;
    }).filter(Boolean);

    let finalPercent = null;

    for (const skill of skills) {
      for (const combatType of combatSkills) {
        if (skill.name.includes(combatType) && type.includes(combatType.split(' ')[0])) {
          finalPercent = skill.percent;
          break;
        }
      }
      if (finalPercent !== null) break;
    }

    if (finalPercent === null) {
      finalPercent = Math.floor(basePercent / 2); // Trudna próba
    }

    const li = $(`<li>${name} (${type}) — ${finalPercent}% <span class="delete-btn">🗑</span></li>`);
    li.find('.delete-btn').click(() => li.remove());
    $('.weapons-list').append(li);
    $('.weapons-section input').val('');
  });



  // Dodawanie pancerzy i zaklęć bez zmian
  function setupSection(sectionClass, listClass) {
    const section = $(sectionClass);
    const button = section.find('.add-btn');
    const nameInput = section.find('input[type="text"]').eq(0);
    const percentInput = section.find('input[type="number"]');
    const list = section.find(listClass);

    button.click(function () {
      const name = nameInput.val().trim();
      const percent = percentInput.val().trim();
      if (name && percent !== '') {
        list.append(`<li>${name} — ${percent}% <span class="delete-btn">🗑</span></li>`);
        nameInput.val('');
        percentInput.val('');
      }
    });
  }
  function rollDice(times, sides) {
    let total = 0;
    for (let i = 0; i < times; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }
  $('#load-image').click(function () {
    const url = $('#image-url').val().trim();
    if (url) {
      $('#character-image').attr('src', url);
    }
  });
  $('#roll-stats').click(function () {
    const stats = {
      STR: rollDice(3, 6),
      CON: rollDice(3, 6),
      DEX: rollDice(3, 6),
      APP: rollDice(3, 6),
      POW: rollDice(3, 6),
      SIZ: rollDice(2, 6) + 6,
      INT: rollDice(2, 6) + 6,
      EDU: rollDice(3, 6) + 3
    };

    for (const stat in stats) {
      $(`#${stat}`).val(stats[stat]);
    }

    calculateDerived(); // automatycznie przelicza HP, DB itd.
  });
  $('#dark-theme-toggle').click(function () {
    $('body').toggleClass('dark-theme');
    const isDark = $('body').hasClass('dark-theme');
    $(this).text(isDark ? 'Wyłącz tryb ciemny' : 'Włącz tryb ciemny');
  });

  setupSection('.armor-container', '.armor-list');
  setupSection('.spells-section', '.spells-list');
function calculateDerived() {
  const STR = parseInt($('#STR').val()) || 0;
  const CON = parseInt($('#CON').val()) || 0;
  const SIZ = parseInt($('#SIZ').val()) || 0;
  const INT = parseInt($('#INT').val()) || 0;
  const POW = parseInt($('#POW').val()) || 0;
  const DEX = parseInt($('#DEX').val()) || 0;
  const APP = parseInt($('#APP').val()) || 0;
  const EDU = parseInt($('#EDU').val()) || 0;

  const baseHP = Math.ceil((CON + SIZ) / 2);
  const currentHP = parseInt($('#hp').text()) || baseHP;

  // Jeśli aktualne HP nie równa się bazowemu → pokaż oba
  if (currentHP !== baseHP) {
    $('#hp').text(`${currentHP} (bazowe: ${baseHP})`);
  } else {
    $('#hp').text(baseHP);
  }

  $('#pp').text(POW);
  $('#mov').text(10);

  const total = STR + SIZ;
  let db = 'None';
  if (total <= 12) db = '-1D6';
  else if (total <= 16) db = '-1D4';
  else if (total <= 24) db = 'Brak';
  else if (total <= 32) db = '+1D4';
  else if (total <= 40) db = '+1D6';
  else db = '+2D6';
  $('#db').text(db);

  $('#effort-roll').text(STR * 5);
  $('#stamina-roll').text(CON * 5);
  $('#damage-mod').text(db);
  $('#idea-roll').text(INT * 5);
  $('#luck-roll').text(POW * 5);
  $('#agility-roll').text(DEX * 5);
  $('#charm-roll').text(APP * 5);
  $('#knowledge-roll').text(EDU * 5);
}

  $('#STR, #CON, #SIZ, #POW').on('input', calculateDerived);

  $('body').on('click', '.delete-btn', function () {
    if ($('body').hasClass('edit-mode')) {
      $(this).parent().remove();
    }
  });
  $('#edit-mode-toggle').click(function () {
    $('body').toggleClass('edit-mode');
    const isEdit = $('body').hasClass('edit-mode');
    $(this).text(isEdit ? 'Wyłącz tryb edycji' : 'Włącz tryb edycji');

    // Update all display fields with current input values
    $('.info-grid input, .info-grid textarea').each(function () {
      const value = $(this).val();
      const field = $(this).data('field');
      $(this).siblings(`[data-display="${field}"]`).text(value);
    });
  });

  // Update display fields when input changes
  $('.info-grid input, .info-grid textarea').on('input', function () {
    const value = $(this).val();
    const field = $(this).data('field');
    $(this).siblings(`[data-display="${field}"]`).text(value);
  });

  function getCurrentHP() {
    const hpText = $('#hp').text();
    const match = hpText.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  $('#hp-plus').click(function () {
    const newHP = getCurrentHP() + 1;
    $('#hp').text(newHP);
    calculateDerived();
  });

  $('#hp-minus').click(function () {
    const newHP = Math.max(getCurrentHP() - 1, 0);
    $('#hp').text(newHP);
    calculateDerived();
  });
});


