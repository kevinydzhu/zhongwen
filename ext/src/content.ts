import pinyin from "pinyin";
import ToJyutping from "to-jyutping";


let active = false;

let textNodes: Node[] = [];
const chineseRegex = /[\u4e00-\u9FFF]/g;

let containsChinese = (str: string | null) => {
    return str !== null && str !== undefined && str.search(chineseRegex) !== -1;
}

let traverseNodes = (node: Node, nodeList: Node[]) => {
    for (let i = 0; i < node.childNodes.length; i++) {
        if ((node as HTMLElement)?.classList?.contains("pinyin_processed")) {
            continue;
        }
        let child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
            if (containsChinese(child.textContent)) {
                nodeList.push(node);
            }
        } else {
            traverseNodes(child, nodeList);
        }
    }
}

let traverseWebpage = () => {
    let _textNodes: Node[] = []
    traverseNodes(document.getRootNode(), _textNodes);
    textNodes = _textNodes;
    for (let node of textNodes) {
        // console.log((node as HTMLElement)?.innerHTML)
        addPinyin(node)
    }
    console.log(textNodes);
}

let addPinyin = (node: Node) => {
    let element = (node as HTMLElement);
    if (!element || element.classList.contains("pinyin_processed")) {
        return;
    }
    element.classList.add("pinyin_processed");
    let text = element.innerHTML;
    element.innerHTML = "";
    while(text.length > 0) {
        let idx = text.search(chineseRegex);
        if (idx === -1) {
            element.appendChild(document.createTextNode(text));
            // element.appendChild(document.createTextNode(text));
            text = "";
        }
        else if(idx != 0) {
            element.appendChild(document.createTextNode(text.substring(0, idx)));
            // console.log(`concatting ${text.substring(0, idx)}`)
            // element.appendChild(document.createTextNode(text.substring(0, idx)));
            text = text.substring(idx);
        }
        else {
            let char = text[0];
            let chineseCharElement = document.createElement("div");
            chineseCharElement.className = "pinyin"
            // chineseCharElement.appendChild(document.createTextNode(pinyin(char)));
            console.log(pinyin(char));

            let pinyinElement = document.createElement("div");
            pinyinElement.appendChild(document.createTextNode(pinyin(char)[0][0]));
            // pinyinElement.appendChild(document.createTextNode(ToJyutping.getJyutpingText(char)));

            chineseCharElement.appendChild(pinyinElement);
            chineseCharElement.appendChild(document.createTextNode(char));

            element.appendChild(chineseCharElement)
            text = text.substring(1);
        }
        // if (idx == -1) {
        //     let textNode = document.createTextNode(text);
        //     element.insertBefore(textNode, element.childNodes[0]);
        //     text = "";
        // }
        // if (idx != 0) {
        //     let textNode = document.createTextNode(text.substring(0, idx));
        //     element.insertBefore(textNode, element.childNodes[0]);
        //     text = text.substring(idx);
        // }
    }
}

// chrome.action.onClicked.addListener((tab) => {
//     // traverseNodes(document.getRootNode());
//     // console.log("asdf")
//     // active = !active;
//     // const color = active ? 'orange' : 'white';
//     chrome.scripting.executeScript({
//         target: {tabId: tab.id ? tab.id : -1},
//         func: traverseWebpage,
//     }).then(() => {
//         console.log(allNodes);
//     });
// });



window.setTimeout(traverseWebpage, 5);
var target = document.body;
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      traverseWebpage()
    });
});

var config = {
    attributes: true,
    childList: true,
    characterData: true
};
observer.observe(target, config);
