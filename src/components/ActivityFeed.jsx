import React, { useEffect, useState, useRef } from 'react';
import { baseUrl } from '../config/BaseUrl';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import BackLink from './BackLink';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';


const getAllChats = async ({pageParam = 1, fetchWithTokenRefresh}) => {
  const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/chats?page=${pageParam}&limit=10`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activites');
  }

  return response.json();
};

const ActivityFeed = ({
  filterFunc,
  visibleActivity,
  setVisibleActivity,
  filterActivity,
}) => {
  const [page, setPage] = useState(1);
  const [chats, setChats] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const [activities, setActivities] = useState([]);
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const { searchQuery, topicFilter, fetchWithTokenRefresh, isLoggedIn, onlineUsers } =
    useAuth();
  const prevActivitesLengthRef = useRef(activities.length);

  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['activites-chats'],
    queryFn: ({ pageParam = 1 }) => getAllChats({pageParam, fetchWithTokenRefresh}),
     getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 60 * 1,
    retry: 1,
    onError: (err) => {
      if (err.message === 'Token expired, please login') {
        logout();
        navigate('/login');
      } else {
        console.error('Error fetching activites:', err);
      }
    },
  });

  useEffect(() => {
    if (data) {
      const merged = data.pages.flatMap((page) => page.chats);
      setActivities(merged);
    }
  }, [data]);

  // useEffect(() => {
  //   if (activities.length !== prevActivitesLengthRef.current) {
  //     refetch();
  //     prevActivitesLengthRef.current = activities.length;
  //   }
  // }, [activities]);

  // reset infinite scroll when search/filter changes
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries(['activites-chats']);
  }, [searchQuery, topicFilter]);

  //infinite scroll observer
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  // const filteredActivities = filterFunc ? activities.filter(filterFunc) : activities;

  const filteredActivities = activities
    .filter((activity) =>
      filterFunc
        ? filterFunc(activity)
        : filterActivity
        ? filterActivity(activity)
        : true
    )
    .filter((activity) =>
      searchQuery
        ? activity?.room?.name
            ?.toLowerCase()
            .includes(searchQuery?.toLowerCase()) ||
          activity?.text?.toLowerCase().includes(searchQuery?.toLowerCase())
        : true
    )
    .filter((activity) =>
      topicFilter
        ? activity?.room?.topic?.name?.toLowerCase() ===
          topicFilter.toLowerCase()
        : true
    );

  return (
    <div>
      <div className='activity'>
        {error && (
          <div
            className='alert alert-danger text-danger alert-dismissible fade show'
            role='alert'
          >
            {error.message}
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='alert'
              aria-label='Close'
            ></button>
          </div>
        )}
        <div className='border border-0 rounded-3'>
          <div className='heading d-flex justify-content-between px-4 pt-2'>
            <div className='d-flex'>
              <div className='back-link'>
                <BackLink
                  visibleActivity={visibleActivity}
                  setVisibleActivity={setVisibleActivity}
                />
              </div>
              <div className='ms-5 f-sm'>RECENT ACTIVITIES</div>
            </div>
            <div></div>
          </div>
          {isLoading ? (
            <div className='container-fluid full-height d-flex justify-content-center align-items-center'>
              <div className='text-center'>
                <div
                  className='spinner-border'
                  style={{ width: '3rem', height: '3rem' }}
                  role='status'
                >
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>

              {/* <div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto">
                <div class="animate-pulse flex space-x-4">
                  <div class="rounded-full bg-slate-700 h-10 w-10"></div>
                  <div class="flex-1 space-y-6 py-1">
                    <div class="h-2 bg-slate-700 rounded"></div>
                    <div class="space-y-3">
                      <div class="grid grid-cols-3 gap-4">
                        <div class="h-2 bg-slate-700 rounded col-span-2"></div>
                        <div class="h-2 bg-slate-700 rounded col-span-1"></div>
                      </div>
                      <div class="h-2 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div> */}

            </div>
          ) : (
            <div className='px-3 py-3 '>
              {filteredActivities.length > 0
                ? filteredActivities?.map((activity) => (
                    <div
                      key={activity?._id}
                      className='bg-elements rounded mb-3 py-1'
                    >
                      <div className='d-flex p-1'>
                        <img
                          className='rounded-circle me-2 display-pic'
                          src={
                            activity?.sender?.profilePicture?.url || blank_img
                          }
                          alt='display picture'
                        />
                        <div>
                          <Link
                            className='linkc'
                            to={`/profile/${activity?.sender?._id}`}
                          >
                            <small className='dim me-2 f-sm'>
                              @{activity?.sender?.username}
                              {onlineUsers.has(activity?.sender?._id) && (
                                <img 
                                    width="10" height="10" 
                                    src="https://img.icons8.com/forma-light-filled/14/40C057/circled.png" 
                                    alt="online"
                                    style={{ marginLeft: "3px" }}
                                />
                              )}
                            </small>
                          </Link>
                          <small className='fw-lighter f-xsm'>
                            {moment(activity?.createdAt).fromNow()}
                          </small>
                          <div>
                            <small className='f-sm'>posted to </small>"
                            <div>
                              <Link
                                to={`/room/${activity?.room?._id}`}
                                className='linkc dim'
                              >
                                "{activity?.room?.name}"
                              </Link>
                            </div>
                            
                          </div>
                        </div>
                      </div>

                      <div className='mx-2 f-sm border border-0 activity-chat mb-2 p-2 rounded'>
                        {activity?.text}
                      </div>
                    </div>
                  ))
                : 'No activities to Show'}

              <div ref={loadMoreRef} style={{ height: '5px' }} />

              {isFetchingNextPage && <p>Loading more...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
