/* Sonnet POS — interactive guest demo.
   All data is fictional sample data held in the visitor's own browser
   (localStorage). Nothing is sent anywhere and no real business data is used. */
(() => {
    'use strict'

    const STORAGE_KEY = 'sonnet-pos-demo-v1'
    const CURR = 'GH₵'

    const seed = {
        business: 'Heaven\u2019s Grace Minimart',
        products: [
            { id: 'P01', name: 'Pure Water Sachet', cat: 'Beverages', pkg: [{ u: 'sachet', price: 1 }, { u: 'bag (30)', price: 27 }], stock: 240, low: 60 },
            { id: 'P02', name: 'Mango Popsicle', cat: 'Frozen', pkg: [{ u: 'piece', price: 2 }, { u: 'carton (30)', price: 48 }], stock: 95, low: 30 },
            { id: 'P03', name: 'Vanilla Ice Pop', cat: 'Frozen', pkg: [{ u: 'piece', price: 2 }, { u: 'carton (30)', price: 48 }], stock: 18, low: 30 },
            { id: 'P04', name: 'Sausage Roll', cat: 'Bakery', pkg: [{ u: 'piece', price: 3 }], stock: 42, low: 15 },
            { id: 'P05', name: 'Milk Bread Loaf', cat: 'Bakery', pkg: [{ u: 'loaf', price: 8 }], stock: 27, low: 8 },
            { id: 'P06', name: 'Vegetable Oil 500ml', cat: 'Groceries', pkg: [{ u: 'bottle', price: 22 }, { u: 'carton (12)', price: 240 }], stock: 64, low: 12 },
            { id: 'P07', name: 'Tomato Paste 70g', cat: 'Groceries', pkg: [{ u: 'tin', price: 4 }, { u: 'carton (48)', price: 168 }], stock: 210, low: 48 },
            { id: 'P08', name: 'Rice 1kg', cat: 'Groceries', pkg: [{ u: 'bag', price: 14 }, { u: 'bag (25)', price: 330 }], stock: 130, low: 20 },
            { id: 'P09', name: 'Granulated Sugar 1kg', cat: 'Groceries', pkg: [{ u: 'bag', price: 12 }, { u: 'bag (20)', price: 220 }], stock: 76, low: 15 },
            { id: 'P10', name: 'Eggs', cat: 'Groceries', pkg: [{ u: 'crate', price: 95 }], stock: 9, low: 5 },
            { id: 'P11', name: 'Soft Drink Can', cat: 'Beverages', pkg: [{ u: 'can', price: 5 }, { u: 'crate (24)', price: 108 }], stock: 144, low: 24 },
            { id: 'P12', name: 'Cooking Salt 500g', cat: 'Groceries', pkg: [{ u: 'pack', price: 3 }, { u: 'carton (60)', price: 150 }], stock: 88, low: 20 }
        ],
        customers: [
            { id: 'C1', name: 'Ama Serwaa', phone: '020 000 0001', credit: 0, advance: 45 },
            { id: 'C2', name: 'Kofi Mensah', phone: '020 000 0002', credit: 132, advance: 0 },
            { id: 'C3', name: 'Esi Boateng', phone: '020 000 0003', credit: 0, advance: 0 },
            { id: 'C4', name: 'Kwame Asante', phone: '020 000 0004', credit: 58, advance: 0 },
            { id: 'C5', name: 'Abena Owusu', phone: '020 000 0005', credit: 0, advance: 20 },
            { id: 'C6', name: 'Yaw Darko', phone: '020 000 0006', credit: 300, advance: 0 }
        ],
        sales: seedSales()
    }

    function seedSales() {
        const t = Date.now()
        return [
            { id: 'S010', at: t - 2 * 3600e3, items: [{ pid: 'P02', u: 'piece', q: 4, p: 2 }], disc: 0, pay: 'cash', cust: null },
            { id: 'S011', at: t - 4 * 3600e3, items: [{ pid: 'P01', u: 'sachet', q: 10, p: 1 }, { pid: 'P04', u: 'piece', q: 2, p: 3 }], disc: 0, pay: 'momo', cust: 'C1' },
            { id: 'S012', at: t - 6 * 3600e3, items: [{ pid: 'P08', u: 'bag', q: 1, p: 14 }, { pid: 'P09', u: 'bag', q: 2, p: 12 }], disc: 2, pay: 'credit', cust: 'C2' },
            { id: 'S013', at: t - 26 * 3600e3, items: [{ pid: 'P11', u: 'crate (24)', q: 1, p: 108 }], disc: 0, pay: 'cash', cust: null },
            { id: 'S014', at: t - 27 * 3600e3, items: [{ pid: 'P06', u: 'bottle', q: 2, p: 22 }], disc: 0, pay: 'advance', cust: 'C5' }
        ]
    }

    const state = load()

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
        kpiSales: document.getElementById('kpi-sales'),
        kpiTx: document.getElementById('kpi-tx'),
        kpiCredit: document.getElementById('kpi-credit'),
        kpiLow: document.getElementById('kpi-low'),
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
        payMethods: document.getElementById('pay-methods'),
        momoRef: document.getElementById('momo-ref'),
        checkMomo: document.getElementById('check-momo'),
        completeSale: document.getElementById('complete-sale'),
        checkoutHint: document.getElementById('checkout-hint'),
        productsTbody: document.getElementById('products-tbody'),
        custList: document.getElementById('cust-list'),
        custDetail: document.getElementById('cust-detail'),
        reportSummary: document.getElementById('report-summary'),
        reportPayments: document.getElementById('report-payments'),
        reportSellers: document.getElementById('report-sellers'),
        reportLow: document.getElementById('report-low'),
        resetDemo: document.getElementById('reset-demo')
    }

    let cart = []
    let activeCat = 'all'

    /* ---------- navigation ---------- */
    document.querySelectorAll('.demo-nav-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.demo-nav-item').forEach((b) => b.classList.toggle('active', b === btn))
            document.querySelectorAll('.demo-view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + btn.dataset.view))
            window.scrollTo({ top: 0 })
        })
    })

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
        els.kpiSales.textContent = fmt(sales)
        els.kpiTx.textContent = today.length
        els.kpiCredit.textContent = fmt(state.customers.reduce((s, c) => s + c.credit, 0))
        els.kpiLow.textContent = lowStock().length
        els.dashDate.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

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
        els.catChips.innerHTML = cats.map((c) => `<button class="chip${c === activeCat ? ' active' : ''}" data-cat="${c}">${c === 'all' ? 'All' : c}</button>`).join('')
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
            <div class="prod-card${p.stock <= p.low ? ' low' : ''}" data-pid="${p.id}">
                <strong class="pc-name">${p.name}</strong>
                <span class="pc-cat">${p.cat}</span><span class="pc-stock">${p.stock} in stock</span>
                <div class="pc-pkgs">${p.pkg.map((k, i) =>
                    `<button class="pkg" data-pid="${p.id}" data-idx="${i}" ${p.stock <= 0 ? 'disabled' : ''}>${k.u}<br><b>${fmt(k.price)}</b></button>`).join('')}</div>
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
            momoRef: pm === 'momo' ? els.checkMomo.value.trim() : null
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
        renderCart(); renderDashboard(); renderProducts(); renderCustomers(); renderReports(); fillCustomers()
        showReceipt(sale)
    })

    function showReceipt(sale) {
        const tmpl = document.getElementById('receipt-template')
        const receipt = tmpl.content.cloneNode(true).querySelector('.receipt')
        document.body.appendChild(receipt)
        const paper = receipt.querySelector('#receipt-paper')
        const lines = () => sale.items.map((it) => {
            const p = productById(it.pid)
            return `<tr><td>${p.name}<br><small>${it.u} × ${it.q} @ ${fmt(it.p)}</small></td><td class="ra">${fmt(it.q * it.p)}</td></tr>`
        }).join('')
        const cust = sale.cust ? customerById(sale.cust) : null
        const payLabel = { cash: 'Cash', momo: 'Mobile Money', credit: 'Credit added to ledger', advance: 'Advance balance' }[sale.pay]
        paper.innerHTML = `
            <div class="rp-head"><strong>${state.business}</strong><br>Sonnet POS · Demo receipt<br><small>${new Date(sale.at).toLocaleString('en-GB')} · ${sale.id}</small></div>
            <table>${lines()}
                <tr><td>Discount</td><td class="ra">${fmt(sale.disc)}</td></tr>
                <tr class="rp-tot"><td>Total</td><td class="ra">${fmt(saleNet(sale))}</td></tr>
            </table>
            <p class="rp-pay">${payLabel}${sale.momoRef ? ' · ' + sale.momoRef : ''}<br>${cust ? 'Customer: ' + cust.name : 'Walk-in customer'}</p>
            <p class="rp-fine">DEMO RECEIPT — fictional sample data. Printed by the demo; real deployments print 80mm thermal receipts.</p>`
        receipt.querySelector('#r-close').addEventListener('click', () => receipt.remove())
        receipt.querySelector('#r-close-btn').addEventListener('click', () => receipt.remove())
        receipt.querySelector('#r-print').addEventListener('click', () => {
            const w = window.open('', '_blank', 'width=420,height=640')
            if (!w) return
            w.document.write(`<html><head><title>Receipt</title><style>
                body{font-family:monospace;font-size:13px;max-width:300px;margin:16px auto}
                table{width:100%;border-collapse:collapse}td{padding:3px 0;vertical-align:top}.ra{text-align:right}
                .rp-head{margin-bottom:8px}.rp-tot{border-top:1px dashed #000}.rp-fine{margin-top:12px;font-size:11px}
            </style></head><body>${paper.innerHTML}</body></html>`)
            w.document.close()
            setTimeout(() => w.print(), 300)
        })
    }

    /* ---------- products table ---------- */
    function renderProductsTable() {
        els.productsTbody.innerHTML = state.products.map((p) => {
            const pkgs = p.pkg.map((k) => `${k.u} @ ${fmt(k.price)}`).join(' · ')
            const st = p.stock <= 0 ? '<span class="badge badge-red">Out of stock</span>'
                : p.stock <= p.low ? '<span class="badge badge-amber">Low stock</span>'
                : '<span class="badge badge-green">In stock</span>'
            return `<tr><td><b>${p.name}</b></td><td>${p.cat}</td><td>${pkgs}</td><td class="ra">${fmt(p.pkg[0].price)}</td><td class="ra">${p.stock}</td><td>${st}</td></tr>`
        }).join('')
    }

    /* ---------- customers ---------- */
    function fillCustomers() {
        els.checkCustomer.innerHTML = '<option value="">Walk-in customer</option>' +
            state.customers.map((c) => `<option value="${c.id}">${c.name}${c.credit ? ` — owes ${fmt(c.credit)}` : c.advance ? ` — advance ${fmt(c.advance)}` : ''}</option>`).join('')
    }

    function renderCustomers() {
        els.custList.innerHTML = state.customers.map((c) => `
            <li class="cust-item" data-cid="${c.id}" tabindex="0">
                <strong>${c.name}</strong>
                <span class="cs-phone">${c.phone}</span>
                <span class="cs-bal${c.credit ? ' bad' : ''}">${c.credit ? 'Owes ' + fmt(c.credit) : c.advance ? 'Advance ' + fmt(c.advance) : 'No balance'}</span>
            </li>`).join('')
        els.custList.querySelectorAll('.cust-item').forEach((li) => li.addEventListener('click', () => renderCustomerDetail(li.dataset.cid)))
    }

    function renderCustomerDetail(cid) {
        const c = customerById(cid)
        const led = state.sales.filter((s) => s.cust === cid).sort((a, b) => a.at - b.at)
        const rows = led.length ? led.map((s) => {
            const t = saleNet(s)
            const sign = s.pay === 'credit' ? `+${fmt(t)}` : `−${fmt(t)}`
            const kind = s.pay === 'credit' ? 'Credit sale' : s.pay === 'advance' ? 'Used advance' : 'Sale'
            return `<tr><td>${pretty(s.at)}</td><td>${s.id}</td><td>${kind}</td><td class="ra">${sign}</td></tr>`
        }).join('') : `<tr><td colspan="4" class="empty">No recorded sales for this customer.</td></tr>`
        els.custDetail.innerHTML = `
            <div class="cust-head">
                <div><h2>${c.name}</h2><span class="cs-phone">${c.phone}</span></div>
                <div class="cust-nums">
                    <span class="k">Outstanding<br><b class="v v-red">${fmt(c.credit)}</b></span>
                    <span class="k">Advance<br><b class="v v-green">${fmt(c.advance)}</b></span>
                </div>
            </div>
            <p class="hint">Payments against credit are recorded by staff in the full system. Record one here to see the ledger update:</p>
            <div class="pay-line">
                <input id="cust-pay" type="number" min="0" value="0" aria-label="Payment amount" style="width:110px">
                <button class="btn btn-ghost btn-small" id="cust-pay-go" type="button">Record payment</button>
            </div>
            <div class="table-scroll"><table class="demo-table">
                <thead><tr><th>When</th><th>Sale</th><th>Kind</th><th>Movement</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>`
        document.getElementById('cust-pay-go').addEventListener('click', () => {
            const amt = Math.max(0, parseFloat(document.getElementById('cust-pay').value) || 0)
            if (amt <= 0) return
            const toDebt = Math.min(c.credit, amt)
            c.credit -= toDebt
            c.advance += amt - toDebt
            save(); renderCustomers(); renderDashboard(); renderCustomerDetail(cid); fillCustomers()
        })
    }

    /* ---------- reports ---------- */
    function renderReports() {
        const sales = state.sales
        const gross = sales.reduce((s, x) => s + saleNet(x), 0)
        const tx = sales.length
        const avg = tx ? gross / tx : 0
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
        renderAll()
    })

    function renderAll() {
        renderDashboard(); renderChips(); renderProducts(); renderCart(); renderProductsTable(); renderCustomers(); fillCustomers(); renderReports()
    }

    renderAll()

    console.info('Sonnet POS demo loaded. All data on this page is fictional sample data stored only in this browser.')
})()