
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getBlogById, toggleLike } from '../services/blogServices';
import { parse } from 'node-html-parser';
import useAuth from '../hooks/useAuth';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { BiMessageSquareDetail, BiSolidMessageSquareDetail } from 'react-icons/bi';
import toast, { Toaster } from 'react-hot-toast';
import CommentBox from '../components/CommentBox';

const Blog = () => {

    const { id } = useParams<{ id: string }>();
    const { user, userDetail } = useAuth();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [commentBoxOpen, setCommentBoxOpen] = useState(false)
    

    // this method returns the whole promise
    // useEffect(() => {
    //     const data = getBlogById(id as string);
    //     setBlog(data);
    //  },[id])

    const content = blog?.body ? parse(blog.body) : null;
    // Render the parsed HTML content
    const renderContent = () => {
        if (!content) return null;
        return <div dangerouslySetInnerHTML={{ __html: content.toString() }} />;
    };

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            const data = await getBlogById(id as string);
            setBlog(data);
            setLoading(false);
        };

        fetchBlog();
    }, [id]);

    // When blog loads, we check if current user has liked it:
    useEffect(() => {
        if (blog && user) {
            setIsLiked(blog.likes.includes(user.uid)); // if blog's likes array includes current user's uid set isLiked to true
        }
    }, [blog, user]);

    const handleLike = async () => {
        if (!user) return;

        // Call Firestore update
        await toggleLike(id as string, user.uid);

        // Update local UI state
        setIsLiked(!isLiked);
        toast.success('Blog Liked');
        
        // Update blog state immediately
        setBlog((prev: any) => {
            if (!prev) return prev; // Ensure prev is not null or undefined
    
            const isAlreadyLiked = prev.likes.includes(user.uid);
            const updatedLikes = isAlreadyLiked
                ? prev.likes.filter((id: string) => id !== user.uid) // Remove like
                : [...prev.likes, user.uid]; // Add like
    
            return {
                ...prev,
                likes: updatedLikes
            };
        });
          
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear().toString();
        return `${month} ${day}, ${year}`;
    };

    if (loading) {
        return (
            <div className='px-7 lg:px-0 md:px-10 lg:max-w-[50rem] mt-7 mx-auto animate-pulse'>
                <div className='bg-gray-100  w-full h-10 rounded-xl'></div>
                <div className='bg-gray-100  w-full h-3 mt-6 rounded-md'></div>
                <div className='bg-gray-100  w-2/3 h-3 mt-6 rounded-md'></div>
                <div className='flex items-center gap-2 mt-10 '>
                    <span className='bg-gray-100 size-14 rounded-full '></span>
                    <span className='bg-gray-100 h-2 rounded-full w-1/4  '></span>
                </div>
                <div className='bg-gray-50 p-10 w-full space-y-6 h-[550px] mt-6 rounded-md'>
                    <div className='bg-gray-100  w-full h-3 rounded-lg'></div>
                    <div className='bg-gray-100  w-full h-3 rounded-lg'></div>
                    <div className='bg-gray-100  w-full h-3 rounded-lg'></div>
                    <div className='bg-gray-100  w-full h-3 rounded-lg'></div>
                    <div className='bg-gray-100  w-full h-3 rounded-lg'></div>
                    <div className='bg-gray-100  w-full h-40 rounded-lg'></div>
                </div>
            </div>
        )
    }

    
    return (
        <div className='px-7 lg:px-0 md:px-10 lg:max-w-[50rem] mt-7 mx-auto '>
            <div className=''>
                <h1 className='text-2xl md:text-4xl lg:text-4xl font-extrabold font-brand tracking-tight md:tracking-normal'>{blog?.title}</h1>
                <p className='text-lg md:text-xl  text-gray-500 tracking-tight mt-4'>{blog?.summary}</p>

                <div className='flex justify-between mt-9 items-center'>
                    <div className='flex items-center gap-4  w-full'>
                        <img src='/avatar.jpg' className='size-10 md:size-14 rounded-full object-cover' alt="" />
                        <span className='flex justify-between flex-col gap-1'>
                            <p className='text-sm'>{blog?.authorName}</p>
                            <p className='text-sm text-gray-500'>{formatDate(blog?.createdAt)}</p>
                        </span>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className='flex items-center gap-2 cursor-pointer' onClick={handleLike} >
                            {
                                isLiked ? <GoHeartFill size={24} color='red' /> :
                                    <GoHeart size={24} color='gray'  />
                            }
                            <p className='text-sm text-gray-600 font-blog'>{blog?.likes.length}</p>
                        </span>
                        <span className='flex items-center gap-2 cursor-pointer' onClick={() => setCommentBoxOpen(!commentBoxOpen)} >
                            <BiMessageSquareDetail size={24} color='gray'/>
                            <p className='text-sm text-gray-600 font-blog'>{blog.comments.length}</p>
                        </span>
                    </div>
                </div>
            </div>
            {/* <div className='mt-10 w-full hidden md:block'>
                <img src={data?.blogImg} className='h-[30rem] w-full object-cover' alt="" />
            </div> */}

            <div className='mt-12 md:mt-10 border-t py-6 '>
                <p className=' [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-2" [&_p]:md:text-xl [&_p]:text-normal tracking-wide leading-7 md:leading-9 [&_img]:mx-auto [&_img]:my-4  md:tracking-wider font-logo antialiased md:font-semibold md:text-justify text-slate-600 '>
                    {renderContent()}
                </p>
            </div>
            <Toaster/>
            
            {commentBoxOpen && <CommentBox setCommentBoxOpen={setCommentBoxOpen} commentBoxOpen={commentBoxOpen} blogId={id}/>}
       
        </div>
    )
}
export default Blog;
