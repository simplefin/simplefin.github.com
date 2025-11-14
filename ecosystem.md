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
    gap: 1em;
    row-gap: 1em;
}
.item {
  /* max-width: 120px; */
  padding: 1em;
  display: grid;
  grid-template-areas:
    "title    " 
    "description";
  box-sizing: border-box;
  flex-basis: 48%;
  flex-shrink: 1;
  border: 1px solid lightgray;
  border-radius: 6px;
}
a.item:hover {
  text-decoration: none;
}
.item-title {
  grid-area: title;
  font-size: 1.5em;
  align-self: end;
  font-weight: 400;
  color: black;
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
@media screen and (max-width: 600px) {
  .item {
    flex-basis: 100%;
    flex-grow: 1;
    flex-shrink: initial;
  }
}
</style>

Here is some software that supports the SimpleFIN Protocol.  Being listed below does <strong>not</strong> imply that we endorse or guarantee the third party software.

To add to this list, <a href="https://github.com/simplefin/simplefin.github.com/blob/master/ecosystem.md">fork this repo</a> and submit a pull request.

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
  <div class="item-title"><img src="/img/applogos/actual.png" title="Actual Budget logo"></div>
  <div class="item-desc">A local-first personal finance app</div>
</a>

<a class="item" href="https://skwad.app/" target="_blank">
  <div class="item-title"><img src="/img/applogos/skwad.png" title="Skwad logo"></div>
  <div class="item-desc">Track your spending using email alerts (or bank sync)</div>
</a>

<a class="item" href="https://github.com/CodeWithCJ/SparkyBudget" target="_blank">
  <div class="item-title"><img src="/img/applogos/SparkyBudget.png" title="Sparky Budget">Sparky Budget</div>
  <div class="item-desc">Simple Budgeting, Powerful Results</div>
</a>

<a class="item" href="https://envelopebudget.com" target="_blank">
  <div class="item-title"><img src="/img/applogos/envelopebudget.png" title="EnvelopeBudget logo"> EnvelopeBudget</div>
  <div class="item-desc">Envelope method for the digital age</div>
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
