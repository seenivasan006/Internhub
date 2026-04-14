
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const LocationRequester = () => {
    const { user, updateUser } = useAuth();

    useEffect(() => {
        if (!user) return;

        // If location is already set, don't ask again
        if (user.location && user.state) return;

        const requestLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            if (data.address) {
                                const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                                const state = data.address.state || '';

                                // Update user profile via API
                                await fetch('/api/profile/update', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ location: city, state: state })
                                });

                                // Update local auth context
                                updateUser({ ...user, location: city, state: state });
                                console.log('📍 Location updated successfully');
                            }
                        } catch (err) {
                            console.error("Geocoding failed", err);
                        }
                    },
                    (error) => {
                        console.log('Location permission denied or failed', error);
                    }
                );
            }
        };

        requestLocation();
    }, [user]);

    return null; // Invisible component
};
