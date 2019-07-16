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
  if (selectType === 'expense') {
    whoID.insertAdjacentHTML('beforebegin', `
    <div class="form-group value-inserted">
      <input type="number" name="value" class="form-control" placeholder="Value">
    </div>
    `);
  } else if (selectType === 'task') {
    $('.value-inserted').remove();
  }
}
