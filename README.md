# Articulated
demo: https://marbeler.github.io/articulated/

Articulated is a blockchain-based blog, where anyone can publish articles and create new themes, so the articles could be separated by the theme, once the theme is created, the user can select it in the creation modal, once the article is created, anyone can see it, and to unlock all the content of the article, the user needs to pay a certain amount to the creator, the, it is unlocked forever.

By making the articles separated by theme, the user can click on a theme in the bottom right part of the page, where is a Themes List. Once the theme is clicked, all the posts with that specific theme will be shown.

## Methods
createPost: Giving the values of the title, image, content, date, theme index, and price, it adds the post to the map, and relates the post to the theme

createTheme: Just by giving the name of the new theme, it is added by his index

getPost: Giving the index of the post, returns all the data of it

getPostsLength: Returns the total number of posts

getPostsUnlocked: Returns all the posts that an especific address has unlocked

getTheme: Returns the info of a theme by his index

getThemedPosts: Returns an array with all the posts related to a theme index

getThemesLength: Returns the total number of Themes

unlockPost: Giving th index of the post, it gets all the data of the post, and transfers the cUSD from one account to other by the price indicated in the product data

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
