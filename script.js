const form = document.getElementById('booking-form');
const successMessage = document.getElementById('success-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const barber = document.getElementById('barber').value;
    const service = document.getElementById('service').value;

    // Combine date and time, and convert to UTC
    const localDateTime = new Date(`${date}T${time}`);
    const utcDateTime = new Date(localDateTime.getTime() - localDateTime.getTimezoneOffset() * 60000);

    try {
        const response = await fetch('http://localhost:1337/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    customer_name: name,
                    Date: utcDateTime.toISOString(),
                    barber: barber,
                    service: service
                }
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create appointment');
        }

        const result = await response.json();
        console.log('Appointment created:', result);

        // Show success message
        successMessage.classList.remove('hidden');
        successMessage.offsetHeight; // Force a reflow
        successMessage.classList.add('show');

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 300);
        }, 5000);

        form.reset();
    } catch (error) {
        console.error('Error creating appointment:', error);
        // You might want to show an error message here
    }
});

async function fetchBarbers() {
    try {
        const response = await fetch('http://localhost:1337/api/barbers?populate=profile_picture');
        const data = await response.json();
        console.log('Fetched barber data:', data);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching barbers:', error);
        return [];
    }
}

function createBarberCard(barber) {
    const card = document.createElement('div');
    card.className = 'barber-card';
    
    const name = barber.attributes?.Name || 'Unknown Barber';
    const bio = barber.attributes?.Bio || 'No bio available';
    const profilePictureUrl = barber.attributes?.profile_picture?.data?.attributes?.url
        ? `http://localhost:1337${barber.attributes.profile_picture.data.attributes.url}`
        : 'default-barber-image.jpg';

    card.innerHTML = `
        <img src="${profilePictureUrl}" alt="${name}">
        <h3>${name}</h3>
        <p>${bio}</p>
    `;
    return card;
}

async function populateBarbers() {
    const barberList = document.getElementById('barber-list');
    const barbers = await fetchBarbers();

    barbers.forEach(barber => {
        const barberCard = createBarberCard(barber);
        barberList.appendChild(barberCard);
    });

}

function populateBarberDropdown(barbers) {
    const barberSelect = document.getElementById('barber');
    barbers.forEach(barber => {
        const option = document.createElement('option');
        option.value = barber.id;
        option.textContent = barber.attributes.Name || 'Unknown Barber';
        barberSelect.appendChild(option);
    });
}

async function fetchServices() {
    try {
        const response = await fetch('http://localhost:1337/api/services');
        const data = await response.json();
        console.log('Fetched service data:', data);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

function populateServiceDropdown(services) {
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = ''; // Clear existing options
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.attributes.Name} - $${service.attributes.Price / 100} (${service.attributes.Duration})`;
        serviceSelect.appendChild(option);
    });
}

async function initializeForm() {
    const barbers = await fetchBarbers();
    const services = await fetchServices();

    populateBarberDropdown(barbers);
    populateServiceDropdown(services);
    populateBarbers(); // This will populate the barber cards
}

document.addEventListener('DOMContentLoaded', initializeForm);
