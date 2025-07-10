import { useEffect } from "react";

export function useInfiniteScroll(loadMore: () => Promise<void>, threshold: number= 250) {

    useEffect(() => {
        const handleScroll = () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - threshold) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loadMore]);
}