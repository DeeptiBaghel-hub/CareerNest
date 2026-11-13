import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';
import { BarChart3, Code2, Layers3, PenTool, Server } from 'lucide-react';

const category = [
    { title: "Frontend Developer", icon: Code2 },
    { title: "Backend Developer", icon: Server },
    { title: "Data Science", icon: BarChart3 },
    { title: "Graphic Designer", icon: PenTool },
    { title: "FullStack Developer", icon: Layers3 }
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
            <div className="mb-4 text-center sm:mb-5">
                <p className="text-sm font-semibold text-muted-foreground">Explore roles by interest</p>
            </div>
            <Carousel className="mx-auto w-full max-w-5xl px-10 py-2">
                <CarouselContent>
                    {
                        category.map(({ title, icon: Icon }) => (
                            <CarouselItem key={title} className="basis-[84%] sm:basis-1/2 lg:basis-1/3">
                                <Button onClick={()=>searchJobHandler(title)} variant="outline" className="group h-[68px] w-full justify-start gap-3 rounded-2xl border-border/80 bg-card px-4 text-left text-sm shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.03] hover:text-primary hover:shadow-md">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Icon className="size-5" /></span>
                                    <span className="truncate">{title}</span>
                                </Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </section>
    )
}

export default CategoryCarousel
