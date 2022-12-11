//! -AUXILIARY FUNCTIONS-

const isContentLoaded = () => {
    if (!document.querySelector("#searchResultsTable")) return false


    const classes = ["market_content_block", "market_home_listing_table", "market_home_main_listing_table", "market_listing_table", "market_listing_table_active"]
    const divClasses = document.querySelector("#searchResultsTable").classList

    if (classes.length !== divClasses.length) return false

    for (let index = 0; index < classes.length; index++) 
        if (classes[index] !== divClasses[index]) return false

    return true
}


const fetchItemId = (DOM) => {
    let str = DOM
    let startIndex = str.indexOf("Market_LoadOrderSpread( ")

    if (startIndex < 0) return ""

    if (str = str.substring(startIndex + 24), " )") {

        if ((startIndex = str.indexOf(" )")) < 0) return ""
        return str.substring(0, startIndex)
    }

    return ""
}



const findDigitIndex = (string) => {
    let firstDigitIndex = null
    let lastDigitIndex = null

    for (let index = 0; index < string.length; index++) {
        if (string[index] >= "0" && string[index] <= "9") {
            if (firstDigitIndex === null) firstDigitIndex = index
            lastDigitIndex = index
        }
    }

    return [firstDigitIndex, lastDigitIndex]
}



const formatPrice = (price) => {
    if (!document.querySelector("span.market_table_value.normal_price > span.normal_price")) return 0

    const IntegerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    const mockPrice = document.querySelector("span.market_table_value.normal_price > span.normal_price").textContent


    const [firstDigitIndex, lastDigitIndex] = findDigitIndex(mockPrice)
    
    const currencyFirst = mockPrice.slice(0, firstDigitIndex)
    const currencySecond = mockPrice.slice(lastDigitIndex + 1)
    const priceString = mockPrice.slice(firstDigitIndex, lastDigitIndex + 1)


    let decimalSeparator = priceString[priceString.length - 3]
    let formatterSeparator = decimalSeparator === "." ? "," : "."
    const hasDecimals = decimalSeparator === "." || decimalSeparator === ","


    if (!hasDecimals) {
        decimalSeparator = ","
        formatterSeparator = "."
    } 


    const number = Math.floor((price * 100) / 100)
    let decimals = Math.floor(price * 100) % 100

    
    if (decimals === 0) decimals = "00"
    else if (decimals < 10) decimals = "0" + decimals


    const priceFormatted = IntegerFormatter.format(number).replace(decimalSeparator, formatterSeparator) + decimalSeparator + decimals


    return currencyFirst + priceFormatted + currencySecond
}



const convertPrice = (price) => {
    const IntegerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    const [firstDigitIndex, lastDigitIndex] = findDigitIndex(price)


    const priceString = price.slice(firstDigitIndex, lastDigitIndex + 1)
    const currencyFirst = price.slice(0, firstDigitIndex)
    const currencySecond = price.slice(lastDigitIndex + 1)


    const decimalSeparator = priceString[priceString.length - 3]
    const hasDecimals = decimalSeparator === "." || decimalSeparator === ","


    if (hasDecimals) {
        const formatterSeparator = decimalSeparator === "." ? "," : "."

        const priceNumber = +(priceString.replace(formatterSeparator, "").replace(",", "."))

        if (priceNumber === 0) return currencyFirst + "0" + decimalSeparator + "00" + currencySecond


        let priceWithoutFee = Math.floor((+((priceNumber / 1.15).toFixed(2)) - 0.01) * 100)
        let decimals = priceWithoutFee % 100    
        priceWithoutFee = Math.floor(priceWithoutFee / 100)

        if (decimals === 0) decimals = "00"
        else if (decimals < 10) decimals = "0" + decimals

        const priceFormatted = IntegerFormatter.format(priceWithoutFee).replace(decimalSeparator, formatterSeparator) + decimalSeparator + decimals


        return currencyFirst + priceFormatted + currencySecond
    }
    else {
        const priceNumber = +priceString

        if (priceNumber === 0) return currencyFirst + "0" + currencySecond

        const priceWithoutFee = Math.floor(priceNumber / 1.15)

        return currencyFirst + priceWithoutFee + currencySecond
    }


}



const setWidths = () => {
    if (
        !document.querySelector("#searchResults") ||
        !document.querySelector("[data-sorttype=name]") ||
        !document.querySelectorAll("div.market_listing_price_listings_block")
    ) return


    const mainContainer = document.querySelector("#searchResults")
    const nameHeader = document.querySelector("[data-sorttype=name]")

    mainContainer.style.setProperty('max-width', "1000px", 'important') 
    nameHeader.style.setProperty('width', "500px", 'important') 


    const [header, ...bodies] = document.querySelectorAll("div.market_listing_price_listings_block")

    header.childNodes[3].style.setProperty('width', "80px", 'important') 
    header.childNodes[8].style.setProperty('width', "100px", 'important') 
    header.childNodes[7].style.setProperty('width', "125px", 'important') 
    header.childNodes[1].style.setProperty('width', "125px", 'important') 


    bodies.forEach((body) => {
        const children = body.childNodes

        children[1].style.setProperty('width', "80px", 'important') 
        children[5].style.setProperty('width', "100px", 'important') 
        children[6].style.setProperty('width', "125px", 'important') 
        children[3].style.setProperty('width', "125px", 'important') 
    })  
}



// ! FETCH VOLUMES

const fetchVolumes = async (url) => {
    const response = await fetch(url)
    const { prices } = await response.json()

    return prices
}

const getVolumes = async (country, currency) => {
    if (!document.querySelectorAll("a.market_listing_row_link")) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const URLs = [...document.querySelectorAll("a.market_listing_row_link")].map(anchor => anchor.href)
    const volumes = []


    const fetchingURLs = []
    for (const url of URLs) {
        const separated = url.split("/")

        const hashName = separated[separated.length - 1]
        const appId = separated[separated.length - 2]

        const baseUrl = `https://steamcommunity.com/market/pricehistory/?country=${country}&currency=${currency}&appid=${appId}&market_hash_name=${hashName}`
        fetchingURLs.push(baseUrl)
    }

    try {
        let fetchedPrices = await Promise.all([
            fetchVolumes(fetchingURLs[0]),
            fetchVolumes(fetchingURLs[1]),
            fetchVolumes(fetchingURLs[2]),
            fetchVolumes(fetchingURLs[3]),
            fetchVolumes(fetchingURLs[4]),
            fetchVolumes(fetchingURLs[5]),
            fetchVolumes(fetchingURLs[6]),
            fetchVolumes(fetchingURLs[7]),
            fetchVolumes(fetchingURLs[8]),
            fetchVolumes(fetchingURLs[9])
        ])

        for (const prices of fetchedPrices) {
            let totalVolume = 0
            const yesterdayDate = new Date(new Date() - 86400000).toUTCString()
    
            for (let index = prices.length - 1; index >= prices.length - 24; index--) {
                const sellDate = new Date(Date.parse(prices[index][0])).toUTCString()
    
                if (Date.parse(sellDate) <= Date.parse(yesterdayDate)) break
                totalVolume += +prices[index][2]
            }
    
            volumes.push(totalVolume)
        }
    }
    catch(error) {
        volumes.concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    return volumes    
}


// ! FETCH BUY ORDERS

const fetchHtml = async (url) => {
    const response = await fetch(url)
    const html = await response.text()

    return html
}


const fetchBuyOrders = async (url) => {
    const data = await fetch(url)
    const { buy_order_graph } = await data.json()

    return buy_order_graph
}


const getBuyOrders = async (country, language, currency) => {
    if (
        !document.querySelectorAll("a.market_listing_row_link") ||
        !document.querySelector("span.market_table_value.normal_price > span.normal_price")
    ) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]


    const URLs = [...document.querySelectorAll("a.market_listing_row_link")].map(anchor => anchor.href)
    const buyOrders = []
    const parser = new DOMParser()


    try {
        let documents = await Promise.all([
            fetchHtml(URLs[0]),
            fetchHtml(URLs[1]),
            fetchHtml(URLs[2]),
            fetchHtml(URLs[3]),
            fetchHtml(URLs[4]),
            fetchHtml(URLs[5]),
            fetchHtml(URLs[6]),
            fetchHtml(URLs[7]),
            fetchHtml(URLs[8]),
            fetchHtml(URLs[9]),
        ])

        const fetchingURLs = []
        for (const html of documents) {
            const dom = parser.parseFromString(html, 'text/html')
            const item_nameid = fetchItemId(dom.documentElement.outerHTML)
            const baseUrl = `https://steamcommunity.com/market/itemordershistogram?country=${country}&language=${language}&currency=${currency}&item_nameid=${item_nameid}`
        
            fetchingURLs.push(baseUrl)
        }


        let fetchedOrders = await Promise.all([
            fetchBuyOrders(fetchingURLs[0]),
            fetchBuyOrders(fetchingURLs[1]),
            fetchBuyOrders(fetchingURLs[2]),
            fetchBuyOrders(fetchingURLs[3]),
            fetchBuyOrders(fetchingURLs[4]),
            fetchBuyOrders(fetchingURLs[5]),
            fetchBuyOrders(fetchingURLs[6]),
            fetchBuyOrders(fetchingURLs[7]),
            fetchBuyOrders(fetchingURLs[8]),
            fetchBuyOrders(fetchingURLs[9]),
        ])
        for (const buy_order_graph of fetchedOrders) {
            const highest_buy_order = formatPrice(buy_order_graph[0][0])
            buyOrders.push(highest_buy_order)      
        }
    }
    catch(error) {
        buyOrders.concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    return buyOrders
}



const appendData = () => {
    if (
        !document.querySelectorAll("div.volume_data") ||
        !document.querySelectorAll("div.buy_order_data")
    ) return
    
    const volumeDivs = [...document.querySelectorAll("div.volume_data")]
    const buyOrderDivs = [...document.querySelectorAll("div.buy_order_data")]


    const script = document.createElement("script")
    script.src = chrome.runtime.getURL("../script.js")
    document.body.append(script)



    window.addEventListener("message", (event) => {
        if (event.source != window) return

        if (event.data.type && event.data.type === "STEAM_DATA") {
            const { country, language, currency } = event.data.steamData

            
            Promise.all([getVolumes(country, currency), getBuyOrders(country, language, currency)])
                .then(values => {
                    volumeDivs.forEach((div, index) => {
                        div.textContent = values[0][index]
                    })

                    buyOrderDivs.forEach((div, index) => {
                        div.textContent = values[1][index]
                    })
                })
        }

    }, false)
}





//! -MAIN FUNCTIONS-

const Header = () => {
    if (!document.querySelector("div.market_listing_price_listings_block")) return

    const header = document.querySelector("div.market_listing_price_listings_block")

    const highestBuyOrder = document.createElement("div")
    const volumePastDay = document.createElement("div")


    highestBuyOrder.classList.add("market_listing_right_cell", "market_sortable_column", "highest_buy_order")
    volumePastDay.classList.add("market_listing_right_cell", "market_sortable_column", "volume_past_day")


    highestBuyOrder.setAttribute("data-sorttype", "buy_order")
    volumePastDay.setAttribute("data-sorttype", "volume")


    highestBuyOrder.textContent = "BUY ORDER"
    volumePastDay.textContent = "VOLUME / 24H"


    header.append(highestBuyOrder)
    header.append(volumePastDay)
}



const Quanities = () => {
    if (!document.querySelectorAll("span.market_listing_num_listings_qty")) return

    const allQuantities = [...document.querySelectorAll("span.market_listing_num_listings_qty")]
    allQuantities.forEach((quantity) => quantity.classList.add("quantity"))
}



const Prices = () => {
    if (
        !document.querySelectorAll("span.market_table_value.normal_price") ||
        !document.querySelectorAll("span.market_table_value.normal_price > span.normal_price")
    ) return 

    const priceContainer = [...document.querySelectorAll("span.market_table_value.normal_price")]
    const salePrice = [...document.querySelectorAll("span.market_table_value.normal_price > span.normal_price")]


    priceContainer.forEach((container, index) => {
        const priceWithoutFees = document.createElement("span")

        priceWithoutFees.classList.add("price_without_fee")
        priceWithoutFees.textContent = convertPrice(salePrice[index].textContent)


        container.append(document.createElement("br"))
        container.append("Without fees:")
        container.append(document.createElement("br"))
        container.append(priceWithoutFees)
    })
}



const Body = () => {
    if (!document.querySelectorAll("div.market_listing_price_listings_block")) return

    const bodies = [...document.querySelectorAll("div.market_listing_price_listings_block")]
    bodies.shift()

    bodies.forEach((body) => {

        const volumeDiv = document.createElement("div")
        const buyOrderDiv = document.createElement("div")


        volumeDiv.classList.add("market_listing_right_cell", "market_listing_num_listings", "volume_data")
        buyOrderDiv.classList.add("market_listing_right_cell", "market_listing_num_listings", "buy_order_data")


        volumeDiv.textContent = 0
        buyOrderDiv.textContent = 0


        body.append(volumeDiv)
        body.append(buyOrderDiv)
    })

    setWidths()
    appendData()
}




//! MAIN

if (isContentLoaded()) {
    Header()
    Quanities()
    Prices()
    Body()
}


const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class" && isContentLoaded()) {
            Header()
            Quanities()
            Prices()
            Body()
        }
    })
})


observer.observe(document.querySelector("#searchResultsTable"), { attributes: true })