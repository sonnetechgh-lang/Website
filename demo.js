/* Sonnet POS — interactive guest demo.
   All data is fictional sample data held in the visitor's own browser
   (localStorage). Nothing is sent anywhere and no real business data is used. */
(() => {
    'use strict'

    const STORAGE_KEY = 'sonnet-pos-demo-v3'
    const CURR = 'GH₵'

    const seed = {
        business: 'Demo Retail Store',
        products: [
            { id: 'P01', name: 'Long Grain Rice 5kg', brand: 'Sample Foods', cat: 'Groceries', batch: 'RCE-042', expiry: '30 Nov 2027', pkg: [{ u: 'bag', price: 165 }], stock: 24, low: 10 },
            { id: 'P02', name: 'Vegetable Cooking Oil 3L', brand: 'Demo Pantry', cat: 'Groceries', batch: 'OIL-118', expiry: '31 Mar 2027', pkg: [{ u: 'bottle', price: 210 }], stock: 6, low: 8 },
            { id: 'P03', name: 'Tomato Paste Carton', brand: 'Sample Foods', cat: 'Groceries', batch: 'TMP-207', expiry: '30 Sep 2027', pkg: [{ u: 'carton', price: 380 }], stock: 0, low: 4 },
            { id: 'P04', name: 'Granulated Sugar 1kg', brand: 'Demo Pantry', cat: 'Groceries', batch: 'SGR-031', expiry: '31 Jan 2028', pkg: [{ u: 'pack', price: 28 }], stock: 4, low: 10 },
            { id: 'P05', name: 'Bottled Water 12-Pack', brand: 'Fictional Springs', cat: 'Drinks', batch: 'WTR-550', expiry: '18 Nov 2027', pkg: [{ u: 'pack', price: 45 }], stock: 72, low: 15 },
            { id: 'P06', name: 'Malt Drink 6-Pack', brand: 'Sample Beverages', cat: 'Drinks', batch: 'MLT-221', expiry: '28 Feb 2027', pkg: [{ u: 'pack', price: 60 }], stock: 40, low: 12 },
            { id: 'P07', name: 'Laundry Detergent 2kg', brand: 'Demo Home Care', cat: 'Household', batch: 'DTG-030', expiry: 'N/A', pkg: [{ u: 'bag', price: 95 }], stock: 18, low: 8 },
            { id: 'P08', name: 'Dishwashing Liquid 1L', brand: 'Demo Home Care', cat: 'Household', batch: 'DSH-009', expiry: 'N/A', pkg: [{ u: 'bottle', price: 35 }], stock: 0, low: 8 },
            { id: 'P09', name: 'Bath Soap 3-Pack', brand: 'Sample Essentials', cat: 'Personal Care', batch: 'SOP-202', expiry: '30 Nov 2028', pkg: [{ u: 'pack', price: 30 }], stock: 26, low: 10 },
            { id: 'P10', name: 'Body Lotion 400ml', brand: 'Sample Essentials', cat: 'Personal Care', batch: 'LTN-620', expiry: '12 Jan 2028', pkg: [{ u: 'bottle', price: 75 }], stock: 5, low: 6 },
            { id: 'P11', name: 'USB Phone Charger', brand: 'Demo Tech', cat: 'Electronics', batch: 'N/A', expiry: 'N/A', pkg: [{ u: 'piece', price: 85 }], stock: 39, low: 10 },
            { id: 'P12', name: 'AA Batteries 4-Pack', brand: 'Demo Tech', cat: 'Electronics', batch: 'BAT-300', expiry: '05 May 2030', pkg: [{ u: 'pack', price: 40 }], stock: 17, low: 10 }
        ],
        customers: [
            { id: 'C1', name: 'Regular Walk-in Customer', phone: '000 000 0000', credit: 0, advance: 120 },
            { id: 'C2', name: 'Sample Mini Mart', phone: '000 000 0000', credit: 132, advance: 0 },
            { id: 'C3', name: 'Demo Office Account', phone: '000 000 0000', credit: 0, advance: 0 },
            { id: 'C4', name: 'Fictional Catering Co.', phone: '000 000 0000', credit: 58, advance: 0 }
        ],
        sales: seedSales()
    }

    function seedSales() {
        const t = Date.now()
        return [
            { id: 'S010', at: t - 2 * 3600e3, items: [{ pid: 'P01', u: 'bag', q: 1, p: 165 }], disc: 0, pay: 'cash', cust: null },
            { id: 'S011', at: t - 4 * 3600e3, items: [{ pid: 'P05', u: 'pack', q: 2, p: 45 }], disc: 0, pay: 'momo', cust: 'C3' },
            { id: 'S012', at: t - 6 * 3600e3, items: [{ pid: 'P07', u: 'bag', q: 1, p: 95 }, { pid: 'P09', u: 'pack', q: 2, p: 30 }], disc: 5, pay: 'credit', cust: 'C2' },
            { id: 'S013', at: t - 26 * 3600e3, items: [{ pid: 'P06', u: 'pack', q: 1, p: 60 }], disc: 0, pay: 'cash', cust: null },
            { id: 'S014', at: t - 27 * 3600e3, items: [{ pid: 'P11', u: 'piece', q: 1, p: 85 }], disc: 0, pay: 'advance', cust: 'C1' }
        ]
    }

    const state = load()
    state.business = seed.business

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) return JSON.parse(raw)
        } catch (e) { /* corrupted -> reseed */ }
        return structuredClone(seed)
    }

    const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { /* storage full */ } }

    const fmt = (n) => CURR + ' ' + Number(n || 0).toFixed(2)
    const ghs = (n) => Number(n || 0).toFixed(2)

    const els = {
        dashDate: document.getElementById('dash-date'),
        kpiProducts: document.getElementById('kpi-products'),
        kpiSales: document.getElementById('kpi-sales'),
        kpiCredit: document.getElementById('kpi-credit'),
        kpiLow: document.getElementById('kpi-low'),
        kpiOut: document.getElementById('kpi-out'),
        bestSellers: document.getElementById('best-sellers'),
        recentSales: document.getElementById('recent-sales'),
        posSearch: document.getElementById('pos-search'),
        catChips: document.getElementById('cat-chips'),
        prodGrid: document.getElementById('prod-grid'),
        cartEmpty: document.getElementById('cart-empty'),
        cartItems: document.getElementById('cart-items'),
        cartSub: document.getElementById('cart-sub'),
        cartDisc: document.getElementById('cart-disc'),
        cartTotal: document.getElementById('cart-total'),
        checkCustomer: document.getElementById('check-customer'),
        paymentSelect: document.getElementById('payment-select'),
        payMethods: document.getElementById('pay-methods'),
        momoRef: document.getElementById('momo-ref'),
        checkMomo: document.getElementById('check-momo'),
        amountPaid: document.getElementById('amount-paid'),
        completeSale: document.getElementById('complete-sale'),
        receiptReady: document.getElementById('receipt-ready'),
        viewReceipt: document.getElementById('view-receipt'),
        checkoutHint: document.getElementById('checkout-hint'),
        productsSearch: document.getElementById('products-search'),
        productsFilter: document.getElementById('products-filter'),
        productsTbody: document.getElementById('products-tbody'),
        reportCount: document.getElementById('report-count'),
        reportRevenue: document.getElementById('report-revenue'),
        reportAverage: document.getElementById('report-average'),
        reportSummary: document.getElementById('report-summary'),
        reportPayments: document.getElementById('report-payments'),
        reportSellers: document.getElementById('report-sellers'),
        reportLow: document.getElementById('report-low'),
        resetDemo: document.getElementById('reset-demo')
    }

    let cart = []
    let activeCat = 'all'
    let lastSale = null

    /* ---------- navigation ---------- */
    const navItems = document.querySelectorAll('.demo-nav-item')
    function showView(view) {
        navItems.forEach((b) => b.classList.toggle('active', b.dataset.view === view))
        document.querySelectorAll('.demo-view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view))
    }
    navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
            showView(btn.dataset.view)
            history.replaceState(null, '', '#' + btn.dataset.view)
            closeDrawer()
            window.scrollTo({ top: 0 })
        })
    })
    // Deep links such as demo.html#products open that view directly.
    function showLinkedView() {
        const linked = location.hash.slice(1)
        if ([...navItems].some((b) => b.dataset.view === linked)) showView(linked)
    }
    showLinkedView()
    window.addEventListener('hashchange', showLinkedView)

    const drawerToggle = document.getElementById('demo-drawer-toggle')
    const drawer = document.getElementById('demo-sidebar')
    const drawerBackdrop = document.getElementById('demo-drawer-backdrop')
    function closeDrawer() {
        drawer.classList.remove('open')
        drawerToggle.setAttribute('aria-expanded', 'false')
        drawerBackdrop.hidden = true
    }
    drawerToggle.addEventListener('click', () => {
        const open = !drawer.classList.contains('open')
        drawer.classList.toggle('open', open)
        drawerToggle.setAttribute('aria-expanded', String(open))
        drawerBackdrop.hidden = !open
    })
    drawerBackdrop.addEventListener('click', closeDrawer)
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer() })

    /* ---------- helpers ---------- */
    const todayRange = () => {
        const d = new Date()
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        return [start, d.getTime()]
    }
    const totalOf = (items) => items.reduce((s, it) => s + it.q * it.p, 0)
    const saleNet = (s) => totalOf(s.items) - (s.disc || 0)
    const productById = (id) => state.products.find((p) => p.id === id)
    const customerById = (id) => state.customers.find((c) => c.id === id)
    const lowStock = () => state.products.filter((p) => p.stock <= p.low)
    const pretty = (ts) => new Date(ts).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    /* ---------- dashboard ---------- */
    function renderDashboard() {
        const [start, end] = todayRange()
        const today = state.sales.filter((s) => s.at >= start && s.at <= end)
        const sales = today.reduce((sum, s) => sum + saleNet(s), 0)
        els.kpiProducts.textContent = state.products.length
        els.kpiSales.textContent = fmt(sales)
        els.kpiCredit.textContent = fmt(state.customers.reduce((s, c) => s + c.credit, 0))
        els.kpiLow.textContent = lowStock().length
        els.kpiOut.textContent = state.products.filter((p) => p.stock <= 0).length
        els.dashDate.textContent = new Date().toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

        const byPid = {}
        state.sales.forEach((s) => s.items.forEach((it) => { byPid[it.pid] = (byPid[it.pid] || 0) + it.q }))
        const top = Object.entries(byPid).sort((a, b) => b[1] - a[1]).slice(0, 5)
        els.bestSellers.innerHTML = top.length
            ? top.map(([pid, q]) => `<li><span class="nm">${productById(pid).name}</span><span class="qt">${q} sold</span></li>`).join('')
            : '<li class="empty">Make a sale in the demo to see best sellers.</li>'

        const recent = [...state.sales].sort((a, b) => b.at - a.at).slice(0, 5)
        els.recentSales.innerHTML = recent.map((s) => {
            const c = s.cust ? customerById(s.cust).name : 'Walk-in'
            const pay = { cash: 'Cash', momo: 'MoMo', credit: 'Credit', advance: 'Advance' }[s.pay]
            return `<li><span>${c} · ${pay}</span><span class="qt">${fmt(saleNet(s))}</span><span class="ts">${pretty(s.at)}</span></li>`
        }).join('') || '<li class="empty">No sales recorded yet.</li>'
    }

    /* ---------- POS ---------- */
    function renderChips() {
        const cats = ['all', ...new Set(state.products.map((p) => p.cat))]
        els.catChips.innerHTML = cats.map((c) => `<button type="button" class="chip${c === activeCat ? ' active' : ''}" data-cat="${c}">${c === 'all' ? 'All' : c}</button>`).join('')
        els.catChips.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => { activeCat = b.dataset.cat; renderChips(); renderProducts() }))
    }

    function visibleProducts() {
        const q = (els.posSearch.value || '').toLowerCase().trim()
        return state.products.filter((p) =>
            (activeCat === 'all' || p.cat === activeCat) && (!q || p.name.toLowerCase().includes(q)))
    }

    function renderProducts() {
        const list = visibleProducts()
        els.prodGrid.innerHTML = list.map((p) => `
            <div class="prod-card${p.stock <= 0 ? ' out' : p.stock <= p.low ? ' low' : ''}" data-pid="${p.id}">
                <strong class="pc-name">${p.name}</strong>
                <span class="pc-cat">${p.cat}</span><span class="pc-stock">${p.stock} in stock</span>
                <div class="pc-pkgs">${p.pkg.map((k, i) =>
                    `<button type="button" class="pkg" data-pid="${p.id}" data-idx="${i}" ${p.stock <= 0 ? 'disabled' : ''}>${k.u}<br><b>${fmt(k.price)}</b></button>`).join('')}</div>
            </div>`).join('') || '<p class="empty">No products match your search.</p>'
        els.prodGrid.querySelectorAll('.pkg').forEach((b) => b.addEventListener('click', () => addToCart(b.dataset.pid, +b.dataset.idx)))
    }

    function addToCart(pid, idx) {
        const p = productById(pid)
        const k = p.pkg[idx]
        const line = cart.find((l) => l.pid === pid && l.idx === idx)
        if (line) line.q++
        else cart.push({ pid, idx, q: 1 })
        renderCart()
    }

    function renderCart() {
        els.cartEmpty.hidden = cart.length > 0
        els.cartItems.innerHTML = cart.map((l, i) => {
            const p = productById(l.pid)
            const k = p.pkg[l.idx]
            const out = k.price === undefined
            return `<li class="cart-line">
                <span class="cl-name">${p.name} <em>${k.u}</em> · ${fmt(k.price)}</span>
                <span class="cl-q">
                    <button data-op="minus" data-i="${i}" aria-label="Decrease quantity">−</button>
                    <b>${l.q}</b>
                    <button data-op="plus" data-i="${i}" aria-label="Increase quantity">+</button>
                </span>
                <span class="cl-t">${fmt(l.q * k.price)}</span>
                <button data-op="del" data-i="${i}" class="cl-del" aria-label="Remove line">×</button>
            </li>`
        }).join('')

        const sub = (() => { const s = cart.reduce((sum, l) => sum + l.q * productById(l.pid).pkg[l.idx].price, 0); els.cartSub.textContent = fmt(s); return s })()
        const disc = Math.min(Math.max(parseFloat(els.cartDisc.value) || 0, 0), sub)
        els.cartTotal.textContent = fmt(sub - disc)

        els.cartItems.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
            const i = +b.dataset.i
            if (b.dataset.op === 'plus') cart[i].q++
            else if (b.dataset.op === 'minus') { cart[i].q--; if (cart[i].q <= 0) cart.splice(i, 1) }
            else cart.splice(i, 1)
            renderCart()
        }))
    }

    document.getElementById('pos-search').addEventListener('input', renderProducts)
    document.getElementById('cart-disc').addEventListener('input', renderCart)
    els.payMethods.querySelectorAll('input[name="pm"]').forEach((r) => r.addEventListener('change', () => {
        els.momoRef.hidden = r.value !== 'momo'
    }))
    els.paymentSelect.addEventListener('change', () => {
        const radio = els.payMethods.querySelector(`input[value="${els.paymentSelect.value}"]`)
        if (radio) radio.checked = true
        els.momoRef.hidden = els.paymentSelect.value !== 'momo'
    })

    /* ---------- checkout ---------- */
    els.completeSale.addEventListener('click', () => {
        const hint = els.checkoutHint
        hint.textContent = ''
        if (!cart.length) { hint.textContent = 'Add at least one product to complete a sale.'; return }
        const pm = (document.querySelector('input[name="pm"]:checked') || {}).value || 'cash'
        const sub = cart.reduce((s, l) => s + l.q * productById(l.pid).pkg[l.idx].price, 0)
        const disc = Math.min(Math.max(parseFloat(els.cartDisc.value) || 0, 0), sub)
        const total = sub - disc
        const custId = els.checkCustomer.value
        const cust = custId ? customerById(custId) : null
        const typedPaid = parseFloat(els.amountPaid.value)
        const paid = Number.isFinite(typedPaid) && typedPaid > 0 ? typedPaid : (pm === 'credit' ? 0 : total)

        if (pm === 'credit' && cust) {
            if (cust.credit + total > 500) { hint.textContent = `${cust.name} exceeds the ${fmt(500)} credit limit. The full system enforces per-customer limits.`; return }
        }
        if (pm === 'momo' && !els.checkMomo.value.trim()) { hint.textContent = 'Enter a Mobile Money reference to record the payment.'; return }

        const out = state.products.some((p) => {
            const used = cart.filter((l) => l.pid === p.id).reduce((s, l) => s + l.q, 0)
            return p.stock - used < 0
        })
        if (out) { hint.textContent = 'A selected product has insufficient stock. Adjust quantities.'; return }

        cart.forEach((l) => { productById(l.pid).stock -= l.q })
        const sale = {
            id: 'S' + String(Date.now()).slice(-8),
            at: Date.now(),
            items: cart.map((l) => ({ pid: l.pid, u: productById(l.pid).pkg[l.idx].u, q: l.q, p: productById(l.pid).pkg[l.idx].price })),
            disc,
            pay: pm,
            cust: cust ? custId : null,
            momoRef: pm === 'momo' ? els.checkMomo.value.trim() : null,
            paid
        }
        state.sales.push(sale)

        if (cust) {
            if (pm === 'credit') cust.credit += total
            else if (pm === 'advance') cust.advance -= total
        }

        save()
        cart = []
        els.cartDisc.value = '0'
        els.checkMomo.value = ''
        els.amountPaid.value = ''
        lastSale = sale
        els.receiptReady.hidden = false
        els.checkoutHint.textContent = 'Sale saved in this browser only. Open the receipt preview when ready.'
        renderCart(); renderDashboard(); renderProducts(); renderProductsTable(); renderReports(); fillCustomers()
    })

    els.viewReceipt.addEventListener('click', () => { if (lastSale) showReceipt(lastSale) })

    function showReceipt(sale) {
        const tmpl = document.getElementById('receipt-template')
        const receipt = tmpl.content.cloneNode(true).querySelector('.receipt')
        document.body.appendChild(receipt)
        const paper = receipt.querySelector('#receipt-paper')
        const lines = () => sale.items.map((it) => {
            const p = productById(it.pid)
            return `<tr><td>${p.name}</td><td>${it.q}</td><td>${fmt(it.p)}</td><td>${fmt(it.q * it.p)}</td></tr>`
        }).join('')
        const cust = sale.cust ? customerById(sale.cust) : null
        const payLabel = { cash: 'CASH', momo: 'MOBILE MONEY', credit: 'CREDIT', advance: 'ADVANCE BALANCE' }[sale.pay]
        const receiptNumber = 'DEMO-' + new Date(sale.at).getFullYear() + '-' + String(sale.id).replace(/\D/g, '').slice(-4).padStart(4, '0')
        const txnDate = new Date(sale.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        const subtotal = totalOf(sale.items)
        const total = saleNet(sale)
        const paid = Number(sale.paid || 0)
        const logoUrl = new URL('LOGO/sonnet-mark.png', window.location.href).href
        paper.innerHTML = `
            <div class="rp-logo"><img src="${logoUrl}" alt="Sonnet Solutions logo"></div>
            <div class="rp-identity">
                <h3>${state.business}</h3>
                <p>Groceries, household and everyday goods<br>Demo Street, Accra<br>024 000 0000<br>store@example.com</p>
            </div>
            <div class="rp-rule"></div>
            <div class="rp-meta two-col">
                <p><span>Receipt No.:</span><b>${receiptNumber}</b></p>
                <p><span>Date &amp; Time:</span><b>${txnDate}</b></p>
                <p><span>Cashier:</span><b>Demo Operator</b></p>
                <p><span>Payment Method:</span><b>${payLabel}</b></p>
            </div>
            <div class="rp-customer"><span>Customer:</span><b>${cust ? cust.name : 'Walk-in Demo Customer'}</b><small>${cust ? cust.phone : '000 000 0000'}</small></div>
            <table class="rp-items">
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                <tbody>${lines()}</tbody>
            </table>
            <div class="rp-totals">
                <p><span>Subtotal:</span><b>${fmt(subtotal)}</b></p>
                ${sale.disc ? `<p><span>Discount:</span><b>${fmt(sale.disc)}</b></p>` : ''}
                <p class="rp-grand"><span>TOTAL:</span><b>${fmt(total)}</b></p>
            </div>
            <div class="rp-pay">
                <p><span>Total Amount Paid:</span><b>${fmt(paid)}</b></p>
                <p><span>Paid by ${payLabel === 'CASH' ? 'Cash' : payLabel}:</span><b>${fmt(paid)}</b></p>
                ${paid < total ? `<p><span>Demo balance:</span><b>${fmt(total - paid)}</b></p>` : ''}
            </div>
            <p class="rp-thanks">THANK YOU FOR YOUR PATRONAGE</p>
            <p class="rp-fine">DEVELOPED BY SONNET SOLUTIONS / 0545489242</p>
            <p class="rp-demo-note">Demo receipt — fictional sample data only.</p>`
        receipt.querySelector('#r-close').addEventListener('click', () => receipt.remove())
        receipt.querySelector('#r-close-btn').addEventListener('click', () => receipt.remove())
        receipt.querySelector('#r-print').addEventListener('click', () => {
            const w = window.open('', '_blank', 'width=420,height=640')
            if (!w) return
            w.document.write(`<html><head><title>Receipt</title><style>
                @page{size:80mm auto;margin:0}
                *{box-sizing:border-box}
                body{margin:0;background:#fff;color:#111;font-family:Arial,sans-serif;font-size:8pt;line-height:1.32}
                .receipt-paper{width:68mm;max-width:68mm;margin:0 auto;padding:4mm 3.5mm;background:#fff;color:#111;border:0;border-radius:0;font-size:8pt}
                .rp-logo{text-align:center;margin-bottom:2mm}.rp-logo img{width:19mm;height:auto}.rp-identity{text-align:center}.rp-identity h3{font-size:16pt;line-height:1.08;margin:1mm 0 2mm}.rp-identity p{font-size:8pt;margin:0;color:#4b5563}.rp-rule{border-top:1px dashed #999;margin:5mm 0 4mm}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:4mm 5mm}.rp-meta p,.rp-pay p,.rp-totals p{margin:0}.rp-meta span,.rp-customer span{display:block;color:#4b5563}.rp-meta b,.rp-customer b{display:block}.rp-customer{text-align:left;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:5mm 0 4mm;padding:3mm 0 2mm}.rp-customer small{display:block;color:#4b5563}table{width:100%;border-collapse:collapse}.rp-items th{font-size:7.5pt;text-align:left;border-bottom:1px dashed #999;padding-bottom:2mm}.rp-items td{font-size:7.5pt;padding:2.3mm 0;border-bottom:1px solid #eee;vertical-align:top}.rp-items th:nth-child(n+2),.rp-items td:nth-child(n+2),.rp-pay b,.rp-totals b{text-align:right}.rp-totals{border-top:1px dashed #999;border-bottom:1px solid #eee;margin-top:4mm;padding:3mm 0}.rp-totals p,.rp-pay p{display:flex;justify-content:space-between;gap:4mm;margin:0 0 2mm}.rp-grand{font-size:14pt;font-weight:800}.rp-grand b{color:#0284C7}.rp-pay{padding:3mm 0;border-bottom:1px solid #eee}.rp-thanks{text-align:center;margin:5mm 0 2mm;font-size:7.5pt;font-weight:800;letter-spacing:.08em;color:#9ca3af}.rp-fine{text-align:center;margin:0;font-size:7pt;font-style:italic;letter-spacing:.08em;color:#6b7280}.rp-demo-note{text-align:center;margin:2mm 0 0;font-size:6.5pt;color:#999}
            </style></head><body>${paper.innerHTML}</body></html>`)
            w.document.close()
            setTimeout(() => w.print(), 300)
        })
    }

    /* ---------- products table ---------- */
    function renderProductsTable() {
        const q = (els.productsSearch.value || '').toLowerCase().trim()
        const cat = els.productsFilter.value
        const list = state.products.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) && (cat === 'All Categories' || p.cat === cat))
        els.productsTbody.innerHTML = list.map((p) => {
            const stockClass = p.stock <= 0 ? 'stock-out' : p.stock <= p.low ? 'stock-low' : 'stock-ok'
            return `<tr><td><b>${p.name}</b><small>${p.brand}</small></td><td><span class="category-pill">${p.cat}</span></td><td>${p.batch}</td><td>${p.expiry}</td><td class="${stockClass}">${p.stock} units</td><td class="price">${fmt(p.pkg[0].price)}</td></tr>`
        }).join('')
    }

    function fillProductFilter() {
        const cats = ['All Categories', ...new Set(state.products.map((p) => p.cat))]
        els.productsFilter.innerHTML = cats.map((c) => `<option>${c}</option>`).join('')
    }

    els.productsSearch.addEventListener('input', renderProductsTable)
    els.productsFilter.addEventListener('change', renderProductsTable)

    /* ---------- customers ---------- */
    function fillCustomers() {
        els.checkCustomer.innerHTML = '<option value="">Walk-in customer</option>' +
            state.customers.map((c) => `<option value="${c.id}">${c.name}${c.credit ? ` — owes ${fmt(c.credit)}` : c.advance ? ` — advance ${fmt(c.advance)}` : ''}</option>`).join('')
    }

    /* ---------- reports ---------- */
    function renderReports() {
        const sales = state.sales
        const gross = sales.reduce((s, x) => s + saleNet(x), 0)
        const tx = sales.length
        const avg = tx ? gross / tx : 0
        els.reportCount.textContent = tx
        els.reportRevenue.textContent = fmt(gross)
        els.reportAverage.textContent = fmt(avg)
        els.reportSummary.innerHTML = `
            <li><span class="nm">Total sales recorded</span><span class="qt">${fmt(gross)}</span></li>
            <li><span class="nm">Transactions</span><span class="qt">${tx}</span></li>
            <li><span class="nm">Average sale value</span><span class="qt">${fmt(avg)}</span></li>
            <li><span class="nm">Outstanding credit</span><span class="qt">${fmt(state.customers.reduce((s, c) => s + c.credit, 0))}</span></li>`

        const pm = {}
        sales.forEach((s) => { pm[s.pay] = (pm[s.pay] || 0) + saleNet(s) })
        const pmOrder = { cash: 'Cash', momo: 'Mobile Money', credit: 'Credit', advance: 'Advance' }
        els.reportPayments.innerHTML = Object.keys(pmOrder).filter((k) => pm[k]).map((k) =>
            `<li><span class="nm">${pmOrder[k]}</span><span class="qt">${fmt(pm[k])}</span></li>`).join('') || '<li class="empty">No sales yet.</li>'

        const byPid = {}
        sales.forEach((s) => s.items.forEach((it) => { byPid[it.pid] = (byPid[it.pid] || 0) + it.q }))
        const top = Object.entries(byPid).sort((a, b) => b[1] - a[1]).slice(0, 10)
        els.reportSellers.innerHTML = top.map(([pid, q]) =>
            `<li><span class="nm">${productById(pid).name}</span><span class="qt">${q} sold</span></li>`).join('') || '<li class="empty">No sales yet.</li>'

        const low = lowStock().sort((a, b) => a.stock - b.stock)
        els.reportLow.innerHTML = low.map((p) =>
            `<li><span class="nm">${p.name}</span><span class="qt">${p.stock} left · threshold ${p.low}</span></li>`).join('')
            || '<li class="empty">No low-stock items.</li>'
    }

    /* ---------- reset ---------- */
    els.resetDemo.addEventListener('click', () => {
        try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* ignore */ }
        Object.assign(state, structuredClone(seed))
        cart = []
        els.cartDisc.value = '0'
        els.checkMomo.value = ''
        els.amountPaid.value = ''
        els.receiptReady.hidden = true
        lastSale = null
        renderAll()
    })

    function renderAll() {
        fillProductFilter(); renderDashboard(); renderChips(); renderProducts(); renderCart(); renderProductsTable(); fillCustomers(); renderReports()
    }

    renderAll()

    console.info('Sonnet POS demo loaded. All data on this page is fictional sample data stored only in this browser.')
})()
