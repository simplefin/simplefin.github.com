---
layout: default
---

<style>
h1 {
  margin-top: 4rem;
}
section {
    border: 1px solid lightgrey;

}
.app-list {
    display: flex;
    flex-wrap: wrap;
}
.item {
  /* max-width: 120px; */
  padding: 1rem 2rem 1rem 0;
  display: grid;
  grid-template-areas:
    "title"
    "description";
}
a.item:hover {
  text-decoration: none;
}
.item-title {
  grid-area: title;
  font-size: 1.5em;
  align-self: end;
}
.item-title img {
  max-height: 1.5em;
  object-fit: cover; object-position: 0 0;
}
.item-logo:empty {
  background-color: lightgrey;
}
.item-desc {
  grid-area: description;
  width: 100%;
  font-size: 1em;
}
</style>

Here is some software that supports the SimpleFIN Protocol.  To add to this list, <a href="https://github.com/simplefin/simplefin.github.com/blob/master/ecosystem.md">fork this repo</a> and submit a pull request.

<div class="app-list">

<a class="item" href="https://www.budgetwithbuckets.com" target="_blank">
  <div class="item-title"><img src="/img/applogos/buckets.png" title="Bucket logo"> Buckets</div>
  <div class="item-desc">Local, private budgeting app</div>
</a>

<a class="item" href="https://bridge.simplefin.org" target="_blank">
  <div class="item-title"><img src="/img/applogos/simplefin.png" title="SimpleFIN logo"> SimpleFIN Bridge</div>
  <div class="item-desc">Bridge for banks without SimpleFIN</div>
</a>

<a class="item" href="https://github.com/actualbudget/actual" target="_blank">
  <div class="item-title"><img src="/img/applogos/actual.png" title="Actual Budget"></div>
  <div class="item-desc">A local-first personal finance app</div>
</a>

</div>

<script>
function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
function orderRandomly() {
  let items = Array.from(document.querySelectorAll("a.item"));
  let parent = items[0].parentNode;
  items.forEach(item => {
    parent.removeChild(item);
  })
  shuffle(items);
  items.forEach(item => {
    parent.appendChild(item);
  })
}
orderRandomly();
</script>