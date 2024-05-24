const topNavs = document.getElementsByClassName('top-nav');
const topNavDropItems = document.getElementsByClassName('top-nav__item--has-drop');
const dropNavs = document.getElementsByClassName('drop-nav');

function closeDropNavs(){
  Array.from(dropNavs).forEach((dropNav) => {
    dropNav.classList.remove('top-nav--nav-list__show');
  });
}

Array.from(topNavs).forEach((topNav) => {
  let ham = topNav.getElementsByClassName('top-nav--drop-ham')[0];
  let dropNav = topNav.getElementsByClassName('top-nav--nav-list')[0];

  ham.addEventListener('click', () => {
    closeDropNavs();

    dropNav.classList.toggle('top-nav--nav-list__show');
  });
});

Array.from(topNavDropItems).forEach((navItem) => {
  let dropButton = navItem.getElementsByClassName('top-nav--drop-ham')[0];
  let dropNav = navItem.getElementsByClassName('top-nav--nav-list')[0];

  dropButton.addEventListener('click', () => {
    if(!dropNav.classList.contains('top-nav--nav-list__show')) closeDropNavs();

    dropNav.classList.toggle('top-nav--nav-list__show');
  });
});
