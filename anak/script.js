// Liquid morph element click functionality
document.querySelectorAll('.liquid-morph-element').forEach(element => {
    // Make elements keyboard accessible
    element.tabIndex = 0;
    element.setAttribute('role', 'button');

    element.addEventListener('click', function () {
        // Look for an inline onclick on the element or any clickable child
        let link = this.getAttribute('onclick');
        if (!link) {
            const child = this.querySelector('[onclick]');
            link = child ? child.getAttribute('onclick') : null;
        }
        if (link) {
            const match = link.match(/'([^']+)'/);
            if (match) window.location.href = match[1];
        }
    });

    element.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Same lookup as click: check element then clickable child
            let link = this.getAttribute('onclick');
            if (!link) {
                const child = this.querySelector('[onclick]');
                link = child ? child.getAttribute('onclick') : null;
            }
            if (link) {
                const match = link.match(/'([^']+)'/);
                if (match) window.location.href = match[1];
            }
        }
    });
});
