// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract ThemesBlog {
    uint256 internal postsLength = 0;
    uint256 internal themesLength = 0;
    address internal cUsdTokenAddress =
    0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Post {
        address payable owner;
        string title;
        string image;
        string content;
        string date;
        uint256 theme;
        uint256 price;
    }

    mapping(uint256 => Post) internal posts;

    mapping(uint256 => uint256[]) internal postsThemes;

    mapping(uint256 => string) internal themes;

    mapping(address => uint256[]) internal postsUnlocked;

    modifier isOwner(uint256 _index) {
        require(posts[_index].owner == msg.sender, "Only callable by the owner");
        _;
    }

    function createTheme(string memory _name) public {
        themes[themesLength] = _name;
        themesLength++;
    }

    function createPost(
        string memory _title,
        string memory _image,
        string memory _content,
        string memory _date,
        uint256 _theme,
        uint256 _price
    ) public {
        posts[postsLength] = Post(
            payable(msg.sender),
            _title,
            _image,
            _content,
            _date,
            _theme,
            _price
        );
        postsThemes[_theme].push(postsLength);
        postsLength++;
    }

    function editPost(uint256 _index,
        string memory _title,
        string memory _image,
        string memory _content,
        uint256 _price) public isOwner(_index) {

        posts[_index].title = _title;
        posts[_index].image = _image;
        posts[_index].content= _content;
        posts[_index].price = _price;

    }


    function getPost(uint256 _index)
    public
    view
    returns (
        address payable,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256
    )
    {

        require( posts[_index].owner != address(0), "This post does not exist");
        return (
        posts[_index].owner,
        posts[_index].title,
        posts[_index].image,
        posts[_index].content,
        posts[_index].date,
        posts[_index].theme,
        posts[_index].price
        );
    }

    function unlockPost(uint256 _index) public payable {
        require( posts[_index].owner != address(0), "This post does not exist");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                posts[_index].owner,
                posts[_index].price
            ),
            "Transfer failed."
        );
        postsUnlocked[msg.sender].push(_index);
    }

    function getThemedPosts(uint256 _index)
    public
    view
    returns (uint256[] memory)
    {
        return (postsThemes[_index]);
    }

    function getTheme(uint256 _index) public view returns (string memory) {
        return (themes[_index]);
    }

    function getPostsUnlocked(address _profile)
    public
    view
    returns (uint256[] memory)
    {
        return (postsUnlocked[_profile]);
    }

    function getPostsLength() public view returns (uint256) {
        return (postsLength);
    }

    function getThemesLength() public view returns (uint256) {
        return (themesLength);
    }
}
