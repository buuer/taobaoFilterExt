const IS_TMALL = /^list.tmall.com$/.test(location.hostname)
const IS_TAOBAO = /^s.taobao.com$/.test(location.hostname)
const QUOTE = IS_TAOBAO ? '“' : '"'
const SEARCH_NODE_ID = IS_TAOBAO ? 'q' : 'mq'
const IS_CHROME = (() => {
  try {
    browser
    return false
  } catch (error) {
    return true
  }
})()
const CROSS_BROWSER = IS_CHROME ? chrome : browser

export const utils = {
  storageGet(key) {
    if (IS_CHROME) {
      return new Promise(resolve => chrome.storage.sync.get(key, resolve))
    } else {
      return browser.storage.sync.get(key)
    }
  },

  storageSet(obj) {
    return CROSS_BROWSER.storage.sync.set(obj)
  },

  ready(fn, when = () => !!document.getElementById(SEARCH_NODE_ID)) {
    return when() ? fn() : requestAnimationFrame(() => utils.ready(fn))
  },

  setInputKey(id, val) {
    document.getElementById(id).value = val
  },

  getInputKey(id) {
    return document
      .getElementById(id)
      .value.trim()
      .replace(/["'“”’‘]/g, '')
  },

  setSearchKey(val) {
    utils.setInputKey(SEARCH_NODE_ID, val)
  },

  setBlockKey(val) {
    this.setInputKey('search-block-key-input', val)
  },

  getSearchKey(all = false) {
    if (all) return utils.getInputKey(SEARCH_NODE_ID)
    return utils
      .getInputKey(SEARCH_NODE_ID)
      .replace(/-\S*?(\s|$)/g, '')
      .trim()
  },

  getBlockKey() {
    return utils.getInputKey('search-block-key-input')
  },

  formatBlockKeys(blockKeys = '') {
    return blockKeys
      .split(/\s+/)
      .filter(Boolean)
      .map(k => '-' + k)
      .join(' ')
  },

  blockValInit() {
    return utils
      .getSearchKey(true)
      .split(/\s+/)
      .filter(k => /^-/.test(k))
      .map(k => k.replace(/^-/, ''))
      .join(' ')
  },

  searchWithBlock(blockKeys, searchKey) {
    const formatKey = utils.formatBlockKeys(blockKeys)

    return !formatKey
      ? searchKey
      : [QUOTE, searchKey, formatKey, QUOTE].join(' ')
  },

  getImg(src) {
    const icon = CROSS_BROWSER.runtime.getURL(src)

    const img = new Image()
    img.src = icon
    img.onload = img.remove
    return icon
  },

  callWithErrorLog(fn) {
    try {
      return fn()
    } catch (error) {
      console.error(error)
      return 'error'
    }
  }
}

const renderTaobao = initVal => {
  const icon = utils.getImg('image/icon_64.png')
  return `
  <style>
    .block-key-wrap { position: relative; z-index: 1; clear: left; }
    .block-key-fold { clear:none; border:none !important; float:left; }
    .block-key-fold .wraper { border: none !important; }
    .block-btn-unfold, .block-key-fold .block-btn-fold, .m-header-fixed .block-key-wrap, .block-key-fold .tab-wraper, .block-key-fold .inputs-imgsearch, .block-key-fold .block-key-fold-submit{ display:none }
    .block-key-fold .block-btn-unfold { display: inline-block; width:35px; background: url(${icon}) center/50% no-repeat; position: absolute; height: 35px; cursor: pointer;}
    .block-btn-fold { width:78px; height:31px; text-align:center; line-height:31px; display:inline-block; border-right: solid 2px #f50;background-color:#f5f5f5; }
  </style>
  <div class="wraper" style="border-top:none">
  <div class="tab-wraper"><div class="tab"><div class="selected triggers"> 过滤 </div></div></div>
  <div class="inputs inputs-imgsearch"><div class="search-combobox-input-wrap">
    <input class="search-combobox-input" id="search-block-key-input" value="${initVal}" placeholder="请输入要过滤的词" autocomplete="off" >
  </div></div>

  <span class="block-key-fold-toggle block-btn-fold">收起</span>
  <span class="block-key-fold-toggle block-btn-unfold"></span>
  </div>
  `
}

const renderTmall = initVal => {
  const icon = utils.getImg('image/icon_64.png')
  return `
    <style>
    .block-key-wrap { position: relative; z-index: 1;}
    .block-key-fold { float:right; }
    .relKeyTop {width:auto}
    .block-key-input { width:100%; color: #000; margin: 0; height: 20px; line-height: 20px; padding: 5px 3px 5px 5px; outline: 0; border: none; font-weight: 900; }
    .block-key-line { border-top:none; display: flex; border-right-width: 3px; }
    .block-key-flex-g {flex-grow:1;}
    .block-btn-fold { width: 87px; color: #666; background-color: #f1f1f1; text-align: center; font-size: 16px; letter-spacing: 4px; font-family: '\\5FAE\\8F6F\\96C5\\9ED1',arial,"\\5b8b\\4f53";cursor: pointer; }
    .block-key-fold .block-btn-unfold { display: inline-block; width:35px; background: url(${icon}) center/50% no-repeat; height: 25px; cursor: pointer; }
    .block-key-fold .block-key-line { display:none; }
    </style>
    <div class="mallSearch-form block-key-line">
      <div class="block-key-flex-g">
        <input class="block-key-input" id="search-block-key-input" value="${initVal}" placeholder="请输入要过滤的词" autocomplete="off" >
      </div>
      <div class="block-key-fold-toggle block-btn-fold"> 收起 </div>
    </div>
    <span class="block-key-fold-toggle block-btn-unfold"></span>
  `
}

export const renderBlockInput = (initVal = '', isFold) => {
  const el = document.createElement('div')
  el.id = 'block-key-wrap'
  el.className = isFold ? 'block-key-wrap block-key-fold' : 'block-key-wrap'

  el.innerHTML = IS_TAOBAO
    ? renderTaobao(initVal)
    : IS_TMALL
    ? renderTmall(initVal)
    : ''

  const oldEl = document.getElementById('block-key-wrap')
  if (oldEl) {
    oldEl.replaceWith(el)
  } else if (IS_TAOBAO) {
    document.querySelector('.search').appendChild(el)
  } else if (IS_TMALL) {
    const mallSearch = document.getElementById('mallSearch')
    mallSearch.insertBefore(el, mallSearch.querySelector('.relKeyTop'))
    document.getElementById('header').style = 'height:auto;padding-bottom:10px;'
  }
  return el
}
