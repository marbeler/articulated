import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import { ERC20_DECIMALS, MPContractAddress, cUSDContractAddress } from "./utils/constants" // getting constants from utils folder

let kit
let contract
let posts = []
let post = []

// connect to wallet
const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

// approve payment amount
async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

// get cUSD balance
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

// get posts
const getPosts = async function () {
  const _postsLength = await contract.methods.getPostsLength().call()
  const _posts = []
  for (let i = 0; i < _postsLength; i++) {
    let _post = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getPost(i).call()
      resolve({
        index: i,
        owner: p[0],
        title: p[1],
        image: p[2],
        content: p[3],
        date: p[4],
        theme: p[5],
        price: new BigNumber(p[6])
      })
    })
    _posts.push(_post)
  }
  posts = await Promise.all(_posts)
  renderPosts()
  loadThemes()
}

// made adjustments
async function renderPosts() {

  const postsUnlocked = await contract.methods.getPostsUnlocked(kit.defaultAccount).call()

  document.getElementById("blogposts").innerHTML = ""
  const _themeT = await contract.methods.getTheme(posts[posts.length - 1].theme).call()
  document.getElementById("principalTitle").innerText = posts[posts.length - 1].title
  document.getElementById("principalInfo").innerText = _themeT + " - " + posts[posts.length - 1].date
  document.getElementById("principalImage").src = posts[posts.length - 1].image

  if (postsUnlocked.includes((posts[posts.length - 1].index).toString())) {
    document.getElementById("readLink").innerHTML = `<a class="stretched-link viewPost" style="cursor: pointer;" id="${posts.length - 1}">Read</a>`
  }
  else {
    document.getElementById("readLink").innerHTML = `<a class="stretched-link viewPost" style="cursor: pointer;" id="${posts.length - 1}">Read for ${posts[posts.length - 1].price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</a>`
  }

  posts.forEach(async (_post) => {
    const postsUnlocked = await contract.methods.getPostsUnlocked(kit.defaultAccount).call()
    const themeName = await contract.methods.getTheme(_post.theme).call()
    const newDiv = document.createElement("div");
    newDiv.innerHTML = `<div class="row justify-content-center">${cardTemplate(_post, themeName, postsUnlocked)}</div>`;

    document.getElementById("blogposts").appendChild(newDiv);
  });
}

async function loadThemes() {
  let themes = []
  document.getElementById("themes").innerHTML = ""
  document.getElementById("themesList").innerHTML = '<li><a href="#" class="getAllPosts text-dark">All Themes</a></li>'
  const _themesLength = await contract.methods.getThemesLength().call()
  const _themes = []
  for (let i = 0; i < _themesLength; i++) {
    let _theme = new Promise(async (resolve, reject) => {
      let t = await contract.methods.getTheme(i).call()
      resolve({
        i,
        t
      })
    })
    _themes.push(_theme)
  }
  themes = await Promise.all(_themes)

  themes.forEach(theme => {
    document.getElementById("themes").innerHTML += `<option value="${theme.i}">${theme.t}</option>`
    document.getElementById("themesList").innerHTML += `<li><a href="#" class="getThemedPosts text-dark" id="${theme.i}">${theme.t}</a></li>`
  })
}

async function showPost(_index) {
  let tmp = await contract.methods.getPost(_index).call()

  post = {
    index: _index,
    owner: tmp[0],
    title: tmp[1],
    image: tmp[2],
    content: tmp[3],
    date: tmp[4],
    theme: tmp[5],
    price: new BigNumber(tmp[6])
  }

  const _theme = await contract.methods.getTheme(post.theme).call()

  document.getElementById("postTitle").innerText = post.title
  document.getElementById("postMeta").innerText = _theme + " " + post.date
  document.getElementById("postContent").innerText = post.content


}

function cardTemplate(_post, themeName, postsUnlocked) {

  if (postsUnlocked.includes(_post.index.toString())) {
    return `
      <div class="row g-0 rounded overflow-hidden flex-md-row mb-5 shadow-lg h-md-250"
      style="border-left: .5rem solid #212529;">
        <div class="col p-4">
          <strong class="d-inline-block mb-2 text-primary">${themeName}</strong>
          <h3 class="mb-0">${_post.title}</h3>
          <div class="mb-1 text-muted">${_post.date}</div>
          <a class="stretched-link viewPost" style="cursor: pointer;" id="${_post.index}">Read</a>
          <p class="text-dark fw-light">${truncateContent(_post.content)}</p>
        </div>
        <div class="col-auto d-none d-lg-block">
          <img src="${_post.image}" style="object-fit: cover; width: 250px; height: 100%;">
        </div>
      </div>
    `
  }
  else {
    return `
      <div class="row g-0 rounded overflow-hidden flex-md-row mb-5 shadow-lg h-md-250"
      style="border-left: .5rem solid #212529;">
        <div class="col p-4">
          <strong class="d-inline-block mb-2 text-primary">${themeName}</strong>
          <h3 class="mb-0 text-dark">${_post.title}</h3>
          <div class="mb-1 text-muted"><small>${_post.date}</small></div>
          <a class="stretched-link viewPost" style="cursor: pointer;" id="${_post.index}">Read for ${_post.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</a>
          <p class="text-dark fw-light">${truncateContent(_post.content)}</p>
        </div>
        <div class="col-auto d-none d-lg-block">
          <img src="${_post.image}" style="object-fit: cover; width: 250px; height: 100%;">
        </div>
      </div>
    `
  }
}

// I removed identiconTemplate() function as it has no use here 

// truncate content
function truncateContent(_content) {
  return `${String(_content).substring(0, 250)}...`
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getPosts()
  notificationOff()
});

document
  .querySelector("#newPost")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("postTitleInput").value,
      document.getElementById("postImageInput").value,
      document.getElementById("postContentInput").value,
      new Date().getDate().toString() + " / " + ((new Date().getMonth()) + 1).toString(),
      document.getElementById("themes").value,
      new BigNumber(document.getElementById("postPriceInput").value)
        .shiftedBy(ERC20_DECIMALS)
        .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .createPost(...params)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully added "${params[0]}".`)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    document.getElementById("postTitleInput").value = ""
    document.getElementById("postImageInput").value = ""
    document.getElementById("postContentInput").value = ""
    document.getElementById("postPriceInput").value = ""
    getPosts()
  })

document.querySelector("#newThemeBtn").addEventListener("click", async (e) => {
  notification(`⌛ Adding "${document.getElementById("newTheme").value}"...`)
  try {
    const result = await contract.methods
      .createTheme(document.getElementById("newTheme").value)
      .send({ from: kit.defaultAccount })
    notification(`🎉 You successfully added "${document.getElementById("newTheme").value}".`)
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  loadThemes()
})

document.getElementById("themesList").addEventListener("click", async (e) => {
  if (e.target.className.includes("getThemedPosts")) {
    const index = e.target.id

    const themedPosts = await contract.methods.getThemedPosts(index).call()

    const _posts = []
    for (let i of themedPosts) {
      let _post = new Promise(async (resolve) => {
        let p = await contract.methods.getPost(i).call()
        resolve({
          index: i,
          owner: p[0],
          title: p[1],
          image: p[2],
          content: p[3],
          date: p[4],
          theme: p[5],
          price: new BigNumber(p[6])
        })
      })
      _posts.push(_post)
    }
    posts = await Promise.all(_posts)

    renderPosts()
    loadThemes()

  }
  if (e.target.className.includes("getAllPosts")) {
    getPosts()
  }
})

document.querySelector("#blogposts").addEventListener("click", async (e) => {
  if (e.target.className.includes("viewPost")) {
    displayPost(e)
  }
})

document.querySelector("#principal").addEventListener("click", async (e) => {
  if (e.target.className.includes("viewPost")) {
    displayPost(e)
  }
})

async function displayPost(e) {
  const index = e.target.id

  const postsUnlocked = await contract.methods.getPostsUnlocked(kit.defaultAccount).call()

  if (postsUnlocked.includes(index)) {
    showPost(index)
  }
  else {
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(posts[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${posts[index].title}"...`)
    try {
      const result = await contract.methods
        .unlockPost(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully bought "${posts[index].title}".`)
      getBalance()
      renderPosts()
      showPost(index)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
}