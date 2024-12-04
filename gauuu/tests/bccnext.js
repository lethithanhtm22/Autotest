const puppeteer = require("puppeteer")

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForVerifyDisplayed(page, xPath, timeout) {
    let rs = true
    try {
        await page.waitForSelector(xPath, {
            visible: true,
            timeout
        })
    } catch (error) {
        rs = false
    }
    return rs
}

function isTokenExpired(token) {
    try {
        if (token.startsWith('Bearer')) token = token.split(' ')[1]
        const decoded = jwt.decode(token)  // Decode without verifying signature
        const currentTime = Math.floor(Date.now() / 1000) - 300  // Get current time in seconds

        if (decoded.exp && decoded.exp < currentTime) {
            return true  // Token has expired
        } else {
            return false // Token is still valid
        }
    } catch (error) {
        console.error('Invalid token', error)
        return true  // Treat as expired if token is invalid
    }
}

async function clickElement(page, xPath, timeout = 10000) {

    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            // Click the first element found
            await elements[0].click()
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

async function tapElement(page, xPath, timeout = 10000) {
    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            const boundingBox = await elements[0].boundingBox()
            if (boundingBox) {
                await page.touchscreen.tap(
                    boundingBox.x + boundingBox.width / 2,
                    boundingBox.y + boundingBox.height / 2
                )
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

async function clickElementBox(page, xPath, timeout = 10000) {
    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            const boundingBox = await elements[0].boundingBox()
            if (boundingBox) {
                await page.mouse.click(
                    boundingBox.x + boundingBox.width / 2,
                    boundingBox.y + boundingBox.height / 2
                    , {
                        delay: 35
                    })
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

async function clickPosition(page, x, y) {
    try {
        await page.mouse.click(x, y, {delay: 35})
    } catch (e) {

    }
}


async function clickAllElement(page, xPath, timeout = 10000) {
    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            // Click the first element found
            for (let i = 0; i < elements.length; i++) {
                await elements[i].click()
                await delay(100)
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

function getXpathLast(txt) {
    txt = txt.toLowerCase()
    return `xpath=(//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'${txt.toLowerCase()}')] )[last()]`
}

async function showFrameNotification(page, text, backgroundColor) {
    await page.evaluate((textContent, bgColor) => {
        const overlay = document.createElement('div')
        overlay.style.position = 'fixed'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.width = '100vw'
        overlay.style.height = '100vh'
        overlay.style.backgroundColor = bgColor
        overlay.style.display = 'flex'
        overlay.style.flexDirection = 'column'
        overlay.style.alignItems = 'center'
        overlay.style.justifyContent = 'flex-start' // Align text at the top
        overlay.style.paddingTop = '20px' // Add some spacing from the top
        overlay.style.zIndex = '9999' // Ensure it's on top of other elements
        overlay.style.pointerEvents = 'none' // Allow clicks to pass through the overlay

        const textElement = document.createElement('h1')
        textElement.innerText = textContent
        textElement.style.color = 'white'
        textElement.style.fontSize = '4em' // Increase font size
        textElement.style.margin = '0' // Remove default margin
        textElement.style.pointerEvents = 'auto' // Allow clicks on the text if needed

        overlay.appendChild(textElement)
        document.body.appendChild(overlay)
    }, text, backgroundColor)
}

async function isLoginTelegram(page) {
    try {
        await page.goto('https://web.telegram.org/a/')
        console.log('Xpath login: ', getXpath('log in to telegram', 'in to telegram'))
        await page.waitForSelector(getXpath('in to telegram', 'in to telegram'), {
            visible: true,
            timeout: 20000
        })
        await showFrameNotification(page, 'Need Login', 'rgba(255, 0, 0, 0.2)')//'rgba(0, 128, 0, 0.2)' green
        await delay(10000)
        return false
    } catch (e) {
        return true
    } finally {
        await page.close()
    }
}

function getTelegramChanelJoinUrl(url) {
    //https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3DCats_housewtf
    //https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fjoin%3Finvite%3D3OpsBLZ18FQwY2M6
    if (url.startsWith('https://t.me/+')) {
        return `https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fjoin%3Finvite%3D${url.split('https://t.me/+').pop()}`
    }
    return `https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D${url.split('https://t.me/').pop()}`
}

function getXpathClsIndex(cls, index) {
    return `xpath=(//*[contains(@class, "${cls}")])[${index}]`
}

function getXpathClsLast(cls) {
    return `xpath=(//*[contains(@class, "${cls}")])[last()]`
}

function getXpath(en, vi) {
    if (!vi) {
        vi = en
    }
    return `xpath=//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${en}") or contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${vi}")]`
}

function getXpathSelect(p) {
    return `xpath=(${p})`
}

let browser
let page
step("Start browserbccnext", async () => {
    browser = await puppeteer.launch({
        headless: false,
        args: [`--window-size=1920,1080`],
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    })

    // browser = await puppeteer.connect({
    //     browserWSEndpoint: 'ws://localhost:9222/devtools/browser/ade1b924-b7bf-4968-b2d8-501f43790d96',
    // });

    page = await browser.newPage()
    page.setViewport({width: 1920, height: 1080})
})

step("Login bccnext <arg0> and <arg1>", async function (username, password) {
    await page.goto(`https://dev-bcc-next.baohiemtasco.vn`, {waitUntil: "networkidle2"})
    await delay(2000)
    await clickElement(page, getXpathClsLast("login-form-button"), 5000);
    await delay(1000)
    await page.keyboard.type(username)
    await page.keyboard.press("Tab")
    await page.keyboard.type(password)
    await page.keyboard.press("Enter")
    await delay(5000)
})
// step("status <arg0>", async function (status) {
//     // await clickElement(page,getXpathSelect("//*[@id=\"root\"]/div/div[2]/div[1]/div/header/div/div[2]/div[1]"),5000);
//     // await delay(1000)
//     await clickElement(page,getXpathSelect("//*[@id=\"root\"]/div/div[2]/div[1]/div/header/div/div[2]/div[1]/div/span[2]/div"),5000);
//     await delay(1000)
//     // await page.select(status)
//     await page.click.press("Ready")
//     await delay(3000)
// })
step("search <arg0>", async function (search) {
    // await clickElement(page,getXpathSelect("//*[@id=\"root\"]/div/div[2]/div[1]/div/header/div/div[2]/div[1]"),5000);
    // await delay(1000)
    await clickElement(page, getXpathClsLast("ant-select-selection-search-input"), 5000);
    await delay(1000)
    await clickPosition(page,1730,37)
    await delay(1000)
    // await page.select(search)
    // await page.click.press("Ready")
    // await delay(3000)
})
step("phonebccnext <arg0>", async function (text) {
    await clickElement(page, getXpathClsLast("injected-svg"), 5000);
    await delay(1000)
    // await clickElement(page, getXpathClsLast("ant-input css-af5nc7 ant-input-outlined text-gray-900 text-2xl text-green-500"), 5000);
    // await delay(1000)
    await page.keyboard.type(text, {timeout: 100})
    await delay(2000)
    // const isBtnCall = await waitForVerifyDisplayed(page, getXpathSelect("/html/body/div[3]/div/div[2]/div/div[2]/div/button"), 5000)
    const cc = await clickElement(page, getXpathClsLast("acss-14watmr"), 5000);
    console.log(cc)
    await delay(1000)
    // Chọn radio gọi bằng số nào dưới đây
    await clickElement(page, getXpathSelect("/html/body/div[7]/div/div[2]/div/div[2]/div/div[1]/div[2]/div/div[3]/label"), 5000);
    await delay(1000)
    //gọi
    await clickElement(page, getXpathClsLast("ant-btn css-af5nc7 ant-btn-primary"), 5000);
    await delay(1000)

})
// step("radiobccnext <arg0>", async function (radio) {
//     console.log(12313, radio)
//     await clickElement(radio, getXpathClsLast("ant-radio-wrapper"), 5000);
//     await delay(1000)
// })
;

