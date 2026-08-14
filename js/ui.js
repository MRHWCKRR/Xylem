export function switchPage(targetView) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.view-page').forEach(p => p.classList.remove('active-page'));
    
    const nav = document.querySelector(`.nav-item[data-view="${targetView}"]`);
    const page = document.getElementById(`page-${targetView}`);
    
    if (nav) nav.classList.add('active');
    if (page) page.classList.add('active-page');
}

export function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-visible'), 10);
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}