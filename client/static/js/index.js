const topNavs = document.getElementsByClassName('top-nav');
const topNavLists = document.getElementsByClassName('top-nav--nav-list');

function closeTopNavLists(){
  Array.from(topNavLists).forEach((topNavList) => {
    topNavList.classList.remove('top-nav--nav-list__show');
  });
}

Array.from(topNavs).forEach((topNav) => {
  let ham = topNav.getElementsByClassName('top-nav--drop-ham')[0];
  let topNavList = topNav.getElementsByClassName('top-nav--nav-list')[0];

  ham.addEventListener('click', () => {
    topNavList.classList.toggle('top-nav--nav-list__show');
  });
});

document.addEventListener('click', (e) => {
  if(!e.target.closest('.top-nav')){
    closeTopNavLists();
  }
});
