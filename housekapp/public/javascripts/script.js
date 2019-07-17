document.addEventListener('DOMContentLoaded', () => {
  console.log('IronGenerator JS imported successfully!');
}, false);


// ------------------INVITING ROOMMATES-------------------//

const inviteButton = document.getElementById('add-roommate');

inviteButton.onclick = () => {
  inviteButton.insertAdjacentHTML('beforebegin', `
  <div class="form-group form-invite">
    <input type="email" name="email" class="form-control" placeholder="Roomate email">
    <button type="button" class="btn btn-danger remove-btn">Cancel</button>
  </div>
  `);

  // ----------------UNINVITE BUTTON-------------------- //

  const uninviteButton = document.querySelectorAll('.remove-btn');
  const theDiv = document.querySelectorAll('.form-invite');

  uninviteButton.forEach((element, index, array) => {
    element.onclick = (e) => {
      // console.log('index', index);
      // console.log('AQUI', theDiv[index]);
      theDiv[index].remove();
    };
  });
};

// ---------------------ADD TASK/EXPENSE OPTIONS---------------------------- //

function addValueInput() {
  const whoID = document.getElementById('who-id');
  const selectType = document.getElementById('select-type').value;
  const valueInserted = document.querySelector('.value-inserted');
  if (selectType === 'expense') {
    whoID.insertAdjacentHTML('beforebegin', `
    <div class="form-group value-inserted">
    <input type="number" name="value" class="form-control" placeholder="Total Value" required>
    </div>
    `);
    $('#who-id').remove();
  } else if (selectType === 'task') {
    valueInserted.insertAdjacentHTML('beforebegin', `
    <div id="who-id" class="form-group">
      <label>Who is this for? </label>
      <select class="form-control" name="paidBy">
        {{!-- {{ #each user}} --}}
        <option name="whoOwes" value="name of user">name of user</option>
        <option name="whoOwes" value="second-user">second user</option>
        {{!-- {{ /each }} --}}
      </select>
    </div>
    `);
    $('.value-inserted').remove();
  }
}

// --------------------------CHECK BOX AMOUNT PAID------------------------------- //

// function checkPaidBy() {
//   const checkboxes = document.querySelectorAll('.if-checked');
//   const amountInput = document.querySelectorAll('.amount-paid');
//   console.log(checkboxes, 'this is checkboxes');
//   checkboxes.forEach((checkbox, index, array) => {
//     if (checkbox.checked) {
//       checkbox.insertAdjacentHTML('afterend', `
//       <input type="number" name="amountPaid" class="form-control amount-paid mb-2" placeholder="Amount paid" required="true">
//       `);
//     }
//   });
// }

const checkboxes = document.querySelectorAll('.if-checked');
const amountPaid = document.querySelectorAll('.amount-paid');
const amountOwed = document.querySelectorAll('.amount-owed');

const checkPaidBy = (ev, idx) => {
  if (ev.target.checked) {
    amountPaid[idx].hidden = false;
    amountPaid[idx].disabled = false;
    amountPaid[idx].focus();
  } else {
    amountPaid[idx].value = '';
    amountPaid[idx].disabled = true;
    amountPaid[idx].hidden = true;
  }
};

checkboxes.forEach((el, idx) => {
  el.onchange = (ev) => {
    checkPaidBy(ev, idx);
  };
});

const checkOwedBy = (ev, idx) => {
  if (ev.target.checked) {
    amountOwed[idx].hidden = false;
    amountOwed[idx].disabled = false;
    amountOwed[idx].focus();
  } else {
    amountOwed[idx].value = '';
    amountOwed[idx].disabled = true;
    amountOwed[idx].hidden = true;
  }
};

checkboxes.forEach((el, idx) => {
  el.onchange = (ev) => {
    checkPaidBy(ev, idx);
    checkOwedBy(ev, idx);
  };
});