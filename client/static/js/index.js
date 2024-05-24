const closeNavs = document.getElementsByClassName('close-nav');
const closeNavLists = document.getElementsByClassName('close-nav--nav-list');
const sideHams = document.getElementsByClassName('side-panel--button');

function hideCloseNavLists(){
  Array.from(closeNavLists).forEach((closeNavList) => {
    closeNavList.classList.remove('close-nav--nav-list__show');
  });

  Array.from(sideHams).forEach((ham) => {
    ham.textContent = '>';
  });
}

Array.from(closeNavs).forEach((closeNav) => {
  let ham = closeNav.getElementsByClassName('close-nav--drop-ham')[0];
  let closeNavList = closeNav.getElementsByClassName('close-nav--nav-list')[0];

  ham.addEventListener('click', () => {
    closeNavList.classList.toggle('close-nav--nav-list__show'); 

    if(ham.classList.contains('side-panel--button')){
      if(closeNavList.classList.contains('close-nav--nav-list__show')){
        ham.textContent = '<';
      }else{
        ham.textContent = '>';
      }
    }
  });
});

document.addEventListener('click', (e) => {
  if(!e.target.closest('.close-nav')){
    hideCloseNavLists();
  }
});
