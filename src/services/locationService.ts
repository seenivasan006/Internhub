const fetchFallbackLocation = async (): Promise<{ latitude: number; longitude: number; city: string; state: string }> => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || '',
            state: data.region || ''
        };
    } catch (error) {
        console.error('IP-based location fallback failed:', error);
        throw new Error('Could not detect location automatically');
    }
};

export const requestLocation = (): Promise<{ latitude: number; longitude: number; city: string; state: string }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            fetchFallbackLocation().then(resolve).catch(reject);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                    const state = data.address.state || '';
                    resolve({ latitude, longitude, city, state });
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    resolve({ latitude, longitude, city: '', state: '' });
                }
            },
            async (error) => {
                console.warn('Browser geolocation failed, trying IP fallback...', error.message);
                try {
                    const fallback = await fetchFallbackLocation();
                    resolve(fallback);
                } catch (fallbackError) {
                    reject(error);
                }
            },
            { timeout: 8000, enableHighAccuracy: false }
        );
    });
};
